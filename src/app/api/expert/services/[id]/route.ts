import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const serviceId = Number(id);

  const expert = await prisma.expert.findFirst({ where: { email: session.email }, select: { id: true } });
  if (!expert) return NextResponse.json({ error: "Expert not found" }, { status: 404 });

  const service = await prisma.service.findFirst({ where: { id: serviceId, expertId: expert.id } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const { availableForBooking, duration, rateType } = await req.json();

  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: {
      ...(availableForBooking !== undefined && { availableForBooking: !!availableForBooking }),
      ...(duration !== undefined && { duration: Number(duration) }),
      ...(rateType !== undefined && { rateType: String(rateType) }),
    },
  });

  return NextResponse.json(updated);
}
