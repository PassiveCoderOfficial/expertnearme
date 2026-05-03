import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const KEYS = [
  'bookingFeeEnabled', 'bookingFeeDefault', 'bookingFeeMin', 'bookingFeeMax',
  'platformCommissionPct', 'agentCommissionPct', 'expertSubscriptionCommissionPct',
];

export async function GET() {
  const rows = await prisma.setting.findMany({ where: { key: { in: KEYS } } });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json({
    bookingFeeEnabled: map.bookingFeeEnabled !== 'false',
    bookingFeeDefault: parseFloat(map.bookingFeeDefault ?? '25'),
    bookingFeeMin: parseFloat(map.bookingFeeMin ?? '10'),
    bookingFeeMax: parseFloat(map.bookingFeeMax ?? '50'),
    platformCommissionPct: parseFloat(map.platformCommissionPct ?? '50'),
    agentCommissionPct: parseFloat(map.agentCommissionPct ?? '50'),
    expertSubscriptionCommissionPct: parseFloat(map.expertSubscriptionCommissionPct ?? '20'),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const updates: Array<{ key: string; value: string }> = [];

  if (body.bookingFeeEnabled !== undefined) updates.push({ key: 'bookingFeeEnabled', value: String(body.bookingFeeEnabled) });
  if (body.bookingFeeDefault !== undefined) updates.push({ key: 'bookingFeeDefault', value: String(body.bookingFeeDefault) });
  if (body.bookingFeeMin !== undefined) updates.push({ key: 'bookingFeeMin', value: String(body.bookingFeeMin) });
  if (body.bookingFeeMax !== undefined) updates.push({ key: 'bookingFeeMax', value: String(body.bookingFeeMax) });
  if (body.platformCommissionPct !== undefined) updates.push({ key: 'platformCommissionPct', value: String(body.platformCommissionPct) });
  if (body.agentCommissionPct !== undefined) updates.push({ key: 'agentCommissionPct', value: String(body.agentCommissionPct) });
  if (body.expertSubscriptionCommissionPct !== undefined) updates.push({ key: 'expertSubscriptionCommissionPct', value: String(body.expertSubscriptionCommissionPct) });

  await Promise.all(
    updates.map((u) =>
      prisma.setting.upsert({ where: { key: u.key }, update: { value: u.value }, create: u })
    )
  );

  return NextResponse.json({ ok: true });
}
