import { NextRequest, NextResponse } from 'next/server';
import { createLifetimeCheckout } from '@/lib/lemonsqueezy';
import { prisma } from '@/lib/db';

const TOTAL_SPOTS = 500;
const DEADLINE = new Date('2026-08-15T23:59:59');

export async function POST(request: NextRequest) {
  try {
    // Enforce deadline
    if (new Date() > DEADLINE) {
      return NextResponse.json({ error: 'The lifetime deal has ended.' }, { status: 410 });
    }

    // Enforce spot limit
    const taken = await prisma.expert.count({ where: { foundingExpert: true } });
    if (taken >= TOTAL_SPOTS) {
      return NextResponse.json({ error: 'All founding expert spots have been claimed.' }, { status: 410 });
    }

    const body = await request.json().catch(() => ({}));
    const email = (body.email ?? '').trim().toLowerCase() || undefined;
    const expertName = (body.expertName ?? '').trim() || undefined;

    const checkoutUrl = await createLifetimeCheckout({ email, expertName });
    return NextResponse.json({ ok: true, url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create checkout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
