import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

// LemonSqueezy signs webhook payloads with HMAC-SHA256
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-signature') ?? '';

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = event.meta && (event.meta as Record<string, unknown>).event_name;

  if (eventName === 'order_created') {
    const data = event.data as Record<string, unknown> | undefined;
    const attrs = data?.attributes as Record<string, unknown> | undefined;

    if (!attrs) return NextResponse.json({ ok: true });

    const status = attrs.status as string;
    if (status !== 'paid') return NextResponse.json({ ok: true });

    const customerEmail = (attrs.user_email as string | undefined)?.toLowerCase().trim();
    const customData = (attrs.custom_data as Record<string, string> | null) ?? {};

    if (!customerEmail) return NextResponse.json({ ok: true });

    try {
      // Mark matching expert as founding expert
      const updated = await prisma.expert.updateMany({
        where: {
          email: customerEmail,
          foundingExpert: false,
        },
        data: {
          foundingExpert: true,
          foundingExpertSince: new Date(),
        },
      });

      // If no existing expert record, create a placeholder so the spot is claimed
      if (updated.count === 0) {
        const expertName = customData.expert_name || 'Founding Expert';
        await prisma.expert.upsert({
          where: { email: customerEmail },
          update: {
            foundingExpert: true,
            foundingExpertSince: new Date(),
          },
          create: {
            email: customerEmail,
            name: expertName,
            foundingExpert: true,
            foundingExpertSince: new Date(),
          },
        });
      }

      console.log(`Founding expert marked: ${customerEmail}`);
    } catch (err) {
      console.error('Failed to mark founding expert:', err);
      // Still return 200 so LS doesn't retry — log for manual review
    }
  }

  return NextResponse.json({ ok: true });
}
