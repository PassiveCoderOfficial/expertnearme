import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const rawKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const body = await req.json().catch(() => null);
  if (!body) return corsJson({ error: 'Invalid JSON' }, 400);

  const { expertSlug, serviceId, scheduledAt, name, email, phone, notes, isUrgent } = body;
  if (!name || !scheduledAt) return corsJson({ error: 'name and scheduledAt required' }, 400);

  let expertId: number;
  let fromPcSite = false;
  let apiKeyId: number | null = null;

  if (rawKey) {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await prisma.expertApiKey.findUnique({
      where: { keyHash },
      select: { id: true, expertId: true, active: true },
    });
    if (!apiKey || !apiKey.active) return corsJson({ error: 'Invalid API key' }, 401);
    expertId = apiKey.expertId;
    fromPcSite = true;
    apiKeyId = apiKey.id;
  } else if (expertSlug) {
    const expert = await prisma.expert.findFirst({
      where: { profileLink: expertSlug, allowBooking: true },
      select: { id: true },
    });
    if (!expert) return corsJson({ error: 'Expert not found or bookings disabled' }, 404);
    expertId = expert.id;
  } else {
    return corsJson({ error: 'Provide expertSlug or API key' }, 400);
  }

  let clientId: number;
  if (email) {
    let user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, password: '', role: 'USER', roles: ['USER'], activeRole: 'USER', defaultRole: 'USER' },
        select: { id: true },
      });
    }
    clientId = user.id;
  } else {
    const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}@enm.guest`;
    const user = await prisma.user.create({
      data: { email: guestEmail, name, password: '', role: 'USER', roles: ['USER'], activeRole: 'USER', defaultRole: 'USER' },
      select: { id: true },
    });
    clientId = user.id;
  }

  const service = serviceId
    ? await prisma.service.findFirst({ where: { id: Number(serviceId), expertId }, select: { id: true, duration: true } })
    : null;

  const scheduledDate = new Date(scheduledAt);
  const endsAt = service?.duration ? new Date(scheduledDate.getTime() + service.duration * 60000) : null;
  const origin = req.headers.get('origin') || req.headers.get('referer') || null;

  const [booking, lead] = await prisma.$transaction([
    prisma.booking.create({
      data: {
        expertId, clientId,
        serviceId: service?.id || null,
        scheduledAt: scheduledDate,
        endsAt,
        notes: notes || null,
        isUrgent: Boolean(isUrgent),
        status: 'PENDING',
      },
    }),
    prisma.lead.create({
      data: {
        expertId,
        source: fromPcSite ? 'PC_WEBSITE' : 'ENM_DIRECT',
        sourceUrl: origin,
        name,
        email: email || null,
        phone: phone || null,
        message: notes || null,
        status: 'BOOKED',
      },
    }),
  ]);

  if (apiKeyId) {
    await prisma.expertApiKey.update({ where: { id: apiKeyId }, data: { lastUsedAt: new Date() } });
  }

  return corsJson({ ok: true, bookingId: booking.id, leadId: lead.id }, 201);
}
