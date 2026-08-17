import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function getExpert(session: { userId: number }) {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });
  if (!user) return null;
  return prisma.expert.findUnique({ where: { email: user.email }, select: { id: true } });
}

// GET /api/me/follow-ups — settings, sequences, and the ROI numbers.
export async function GET() {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: "No expert profile" }, { status: 404 });

  const settings = await prisma.followUpSettings.findUnique({
    where: { expertId: expert.id },
  });

  const [own, system] = await Promise.all([
    prisma.followUpSequence.findMany({
      where: { expertId: expert.id },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.followUpSequence.findMany({
      where: { expertId: null, isSystem: true },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const [active, sentTotal, recovered, unreachable] = await Promise.all([
    prisma.followUpEnrollment.count({ where: { expertId: expert.id, status: "ACTIVE" } }),
    prisma.followUpMessage.count({
      where: { enrollment: { expertId: expert.id }, status: "SENT" },
    }),
    prisma.followUpEnrollment.findMany({
      where: { expertId: expert.id, recoveredAt: { not: null } },
      select: { recoveredValue: true, recoveredAt: true },
    }),
    prisma.followUpEnrollment.count({
      where: { expertId: expert.id, stopReason: "NO_CONTACT_METHOD" },
    }),
  ]);

  const recoveredValue = recovered.reduce((sum, r) => sum + (r.recoveredValue ?? 0), 0);
  const valuedCount = recovered.filter((r) => r.recoveredValue != null).length;

  return NextResponse.json({
    settings,
    sequences: { own, system },
    stats: {
      activeEnrollments: active,
      messagesSent: sentTotal,
      leadsRecovered: recovered.length,
      recoveredValue,
      // Surfaced so the number is honest: recoveries without a job value
      // recorded contribute 0 to the total.
      recoveredWithoutValue: recovered.length - valuedCount,
      unreachableLeads: unreachable,
    },
  });
}

// PATCH /api/me/follow-ups — update settings. Creates the row on first use.
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expert = await getExpert(session);
  if (!expert) return NextResponse.json({ error: "No expert profile" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    enabled,
    preferredChannel,
    emailFallback,
    fromName,
    replyToEmail,
    quietHoursStart,
    quietHoursEnd,
    timezone,
    maxMessagesPerLead,
  } = body;

  if (
    preferredChannel !== undefined &&
    !["AUTO", "IN_APP", "EMAIL"].includes(preferredChannel)
  ) {
    return NextResponse.json({ error: "Invalid preferredChannel" }, { status: 400 });
  }
  if (
    maxMessagesPerLead !== undefined &&
    (typeof maxMessagesPerLead !== "number" || maxMessagesPerLead < 1 || maxMessagesPerLead > 10)
  ) {
    return NextResponse.json({ error: "maxMessagesPerLead must be 1-10" }, { status: 400 });
  }
  for (const [key, val] of [
    ["quietHoursStart", quietHoursStart],
    ["quietHoursEnd", quietHoursEnd],
  ] as const) {
    if (val !== undefined && val !== null && (typeof val !== "number" || val < 0 || val > 23)) {
      return NextResponse.json({ error: `${key} must be 0-23` }, { status: 400 });
    }
  }

  const data = {
    ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
    ...(preferredChannel !== undefined ? { preferredChannel } : {}),
    ...(emailFallback !== undefined ? { emailFallback: Boolean(emailFallback) } : {}),
    ...(fromName !== undefined ? { fromName: fromName || null } : {}),
    ...(replyToEmail !== undefined ? { replyToEmail: replyToEmail || null } : {}),
    ...(quietHoursStart !== undefined ? { quietHoursStart } : {}),
    ...(quietHoursEnd !== undefined ? { quietHoursEnd } : {}),
    ...(timezone !== undefined ? { timezone: timezone || "UTC" } : {}),
    ...(maxMessagesPerLead !== undefined ? { maxMessagesPerLead } : {}),
  };

  const settings = await prisma.followUpSettings.upsert({
    where: { expertId: expert.id },
    update: data,
    create: { expertId: expert.id, ...data },
  });

  return NextResponse.json({ ok: true, settings });
}
