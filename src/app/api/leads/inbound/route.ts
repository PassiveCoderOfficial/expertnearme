import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

// PC Pro websites POST here with their expert API key to submit leads
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const rawKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!rawKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 });

  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const apiKey = await prisma.expertApiKey.findUnique({
    where: { keyHash },
    include: { expert: { select: { id: true, allowBooking: true } } },
  });

  if (!apiKey || !apiKey.active) return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { name, email, phone, message, sourceUrl } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const origin = req.headers.get('origin') || req.headers.get('referer') || sourceUrl || null;

  const [lead] = await prisma.$transaction([
    prisma.lead.create({
      data: {
        expertId: apiKey.expertId,
        source: 'PC_WEBSITE',
        sourceUrl: origin,
        name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        status: 'NEW',
      },
    }),
    prisma.expertApiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
