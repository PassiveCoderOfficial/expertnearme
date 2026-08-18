import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";
import { onBookingCompleted, enrollLead, stopEnrollments } from "@/lib/follow-up/engine";
import type { BookingStatus } from "@prisma/client";

// Passive Coder pushes booking_appointments lifecycle here so a job completed
// on a PC site triggers ENM's review-request sequence. One direction only:
// PC owns the booking, ENM owns follow-up.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

// PC booking_appointments.status → ENM BookingStatus
const STATUS_MAP: Record<string, BookingStatus> = {
  pending: "PENDING",
  confirmed: "APPROVED",
  cancelled: "DECLINED",
  completed: "DONE",
  no_show: "DECLINED",
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const rawKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!rawKey) return corsJson({ error: "Missing API key" }, 401);

  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const apiKey = await prisma.expertApiKey.findUnique({
    where: { keyHash },
    select: { id: true, expertId: true, active: true },
  });
  if (!apiKey?.active) return corsJson({ error: "Invalid or revoked API key" }, 401);

  const body = await req.json().catch(() => null);
  if (!body) return corsJson({ error: "Invalid JSON" }, 400);

  const {
    appointmentId,
    tenantId,
    status,
    scheduledAt,
    endsAt,
    customerName,
    customerEmail,
    customerPhone,
    message,
    value,
  } = body;

  if (!appointmentId) return corsJson({ error: "appointmentId required" }, 400);
  if (!status || !(status in STATUS_MAP)) {
    return corsJson(
      { error: `status must be one of: ${Object.keys(STATUS_MAP).join(", ")}` },
      400
    );
  }

  const mapped = STATUS_MAP[status];
  const expertId = apiKey.expertId;

  const existing = await prisma.booking.findUnique({
    where: { pcAppointmentId: String(appointmentId) },
    select: { id: true, expertId: true, status: true, completedAt: true },
  });

  // An API key must not be able to mutate another expert's booking.
  if (existing && existing.expertId !== expertId) {
    return corsJson({ error: "Appointment belongs to another expert" }, 403);
  }

  let bookingId: number;

  if (existing) {
    await prisma.booking.update({
      where: { id: existing.id },
      data: {
        status: mapped,
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
        ...(message !== undefined ? { notes: message || null } : {}),
        ...(tenantId ? { pcTenantId: String(tenantId) } : {}),
      },
    });
    bookingId = existing.id;
  } else {
    if (!scheduledAt || !customerName) {
      return corsJson(
        { error: "scheduledAt and customerName required to create a booking" },
        400
      );
    }

    // Reuse an account when the email matches; otherwise create a placeholder
    // so the booking has an owner, matching /api/public/bookings behaviour.
    let clientId: number;
    if (customerEmail) {
      const user = await prisma.user.upsert({
        where: { email: customerEmail },
        update: {},
        create: {
          email: customerEmail,
          name: customerName,
          password: "",
          role: "USER",
          roles: ["USER"],
          activeRole: "USER",
          defaultRole: "USER",
        },
        select: { id: true },
      });
      clientId = user.id;
    } else {
      const guest = await prisma.user.create({
        data: {
          email: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}@enm.guest`,
          name: customerName,
          password: "",
          role: "USER",
          roles: ["USER"],
          activeRole: "USER",
          defaultRole: "USER",
        },
        select: { id: true },
      });
      clientId = guest.id;
    }

    const booking = await prisma.booking.create({
      data: {
        expertId,
        clientId,
        status: mapped,
        scheduledAt: new Date(scheduledAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        notes: message || null,
        pcAppointmentId: String(appointmentId),
        pcTenantId: tenantId ? String(tenantId) : null,
      },
    });
    bookingId = booking.id;

    // Mirror the booking as a lead so it enters the follow-up pipeline.
    const buyerUser = customerEmail
      ? await prisma.user.findUnique({ where: { email: customerEmail }, select: { id: true } })
      : null;

    const lead = await prisma.lead.create({
      data: {
        expertId,
        source: "PC_WEBSITE",
        name: customerName,
        email: customerEmail || null,
        phone: customerPhone || null,
        message: message || null,
        status: mapped === "DONE" ? "BOOKED" : "QUALIFIED",
        bookingId,
        buyerUserId: buyerUser?.id ?? null,
        value: typeof value === "number" ? value : null,
      },
    });

    // A pending appointment still deserves chasing if it goes quiet.
    if (mapped === "PENDING") {
      enrollLead(lead.id, "NEW_LEAD").catch((err) =>
        console.error("follow-up enroll failed for PC booking lead", lead.id, err)
      );
    }
  }

  if (typeof value === "number") {
    await prisma.lead.updateMany({ where: { bookingId }, data: { value } });
  }

  // Fire lifecycle hooks after the write, never blocking the response.
  if (mapped === "DONE") {
    onBookingCompleted(bookingId).catch((err) =>
      console.error("onBookingCompleted failed for booking", bookingId, err)
    );
  } else if (mapped === "DECLINED") {
    prisma.lead
      .findFirst({ where: { bookingId }, select: { id: true } })
      .then((lead) =>
        lead
          ? Promise.all([
              prisma.lead.update({ where: { id: lead.id }, data: { status: "LOST" } }),
              stopEnrollments(lead.id, "LOST"),
            ])
          : null
      )
      .catch((err) => console.error("cancel hook failed for booking", bookingId, err));
  }

  await prisma.expertApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return corsJson({ ok: true, bookingId, status: mapped }, existing ? 200 : 201);
}
