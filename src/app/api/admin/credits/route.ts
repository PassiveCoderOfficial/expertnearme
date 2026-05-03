import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export async function GET() {
  const session = await getSession();
  if (!session?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (ADMIN_ROLES.has(session.role)) {
      const allCredits = await prisma.expertCredits.findMany({
        include: {
          expert: { select: { id: true, name: true, profileLink: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

      const allTransactions = await prisma.creditTransaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          expert: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({ allCredits, allTransactions });
    }

    const expert = await prisma.expert.findFirst({ where: { email: session.email } });
    if (!expert) {
      return NextResponse.json({ credits: { balance: 0 }, transactions: [] });
    }

    const [credits, transactions] = await Promise.all([
      prisma.expertCredits.findUnique({ where: { expertId: expert.id } }),
      prisma.creditTransaction.findMany({
        where: { expertId: expert.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      credits: credits ?? { expertId: expert.id, balance: 0 },
      transactions,
    });
  } catch (err) {
    console.error("GET /api/admin/credits error:", err);
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { expertId, amount, type, description } = await req.json();

    if (!expertId || amount === undefined || !type) {
      return NextResponse.json({ error: "expertId, amount, and type are required" }, { status: 400 });
    }

    const expert = await prisma.expert.findUnique({ where: { id: Number(expertId) } });
    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    const existing = await prisma.expertCredits.findUnique({ where: { expertId: Number(expertId) } });
    const currentBalance = existing?.balance ?? 0;
    const newBalance = currentBalance + Number(amount);

    if (newBalance < 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    const [credits, transaction] = await prisma.$transaction([
      prisma.expertCredits.upsert({
        where: { expertId: Number(expertId) },
        update: { balance: newBalance },
        create: { expertId: Number(expertId), balance: newBalance },
      }),
      prisma.creditTransaction.create({
        data: {
          expertId: Number(expertId),
          amount: Number(amount),
          balanceAfter: newBalance,
          type,
          description: description || null,
        },
      }),
    ]);

    return NextResponse.json({ credits, transaction }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/credits error:", err);
    return NextResponse.json({ error: "Failed to update credits" }, { status: 500 });
  }
}
