import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const adminView = searchParams.get('admin') === '1' && ADMIN_ROLES.has(session.role);

  if (adminView) {
    // Admin sees all referrals
    const referrals = await prisma.agentReferral.findMany({
      include: {
        referrer: { select: { id: true, name: true, email: true } },
        referredUser: { select: { id: true, name: true, email: true } },
        commissions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCommissions = await prisma.agentCommission.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['PAID', 'APPROVED'] } },
    });

    return NextResponse.json({ referrals, totalPaid: totalCommissions._sum.amount ?? 0 });
  }

  // User sees own referrals + earnings
  const referrals = await prisma.agentReferral.findMany({
    where: { referrerId: session.userId },
    include: {
      referredUser: { select: { id: true, name: true, email: true } },
      commissions: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const earnings = await prisma.agentCommission.aggregate({
    where: { referrerId: session.userId },
    _sum: { amount: true },
  });

  const pendingEarnings = await prisma.agentCommission.aggregate({
    where: { referrerId: session.userId, status: 'PENDING' },
    _sum: { amount: true },
  });

  return NextResponse.json({
    referrals,
    totalEarned: earnings._sum.amount ?? 0,
    pendingEarnings: pendingEarnings._sum.amount ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Generate unique referral code
  const code = `ENM-${session.userId}-${Date.now().toString(36).toUpperCase()}`;

  // Get default commission from settings
  const commissionSetting = await prisma.setting.findUnique({ where: { key: 'expertSubscriptionCommissionPct' } });
  const commissionPct = parseFloat(commissionSetting?.value ?? '20');

  const referral = await prisma.agentReferral.create({
    data: {
      referrerId: session.userId,
      referralCode: code,
      commissionPct,
    },
  });

  return NextResponse.json(referral, { status: 201 });
}
