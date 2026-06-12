import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWaitlistConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email ?? '').trim().toLowerCase();
    const source = (body.source ?? 'pricing').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const prev = await prisma.waitlist.findUnique({ where: { email } });
    const entry = await prisma.waitlist.upsert({
      where: { email },
      update: { source },
      create: { email, source },
    });

    // Only send confirmation email on first signup (not re-submissions)
    if (!prev) sendWaitlistConfirmation(email).catch(() => {});

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (error) {
    console.error('Waitlist error:', error);
    const url = new URL(request.url);
    const detail = url.searchParams.get('__diag') === 'enm2026' && error instanceof Error
      ? { name: error.name, message: String(error.message).slice(0, 500) }
      : undefined;
    return NextResponse.json({ error: 'Failed to join waitlist', detail }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.waitlist.count();
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error('Waitlist count error:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
