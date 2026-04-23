import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/messages — list all conversations for current user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = session.userId;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participant1: uid }, { participant2: uid }] },
    include: {
      user1:    { select: { id: true, name: true, email: true, profile: { select: { avatar: true } } } },
      user2:    { select: { id: true, name: true, email: true, profile: { select: { avatar: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Attach unread counts and the "other" participant
  const result = conversations.map(conv => {
    const other = conv.participant1 === uid ? conv.user2 : conv.user1;
    const lastMsg = conv.messages[0] || null;
    return { id: conv.id, other, lastMsg, updatedAt: conv.updatedAt };
  });

  return NextResponse.json({ conversations: result });
}

// POST /api/messages — start or get conversation, then send first message
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId, content } = await req.json();
  if (!toUserId || !content?.trim()) {
    return NextResponse.json({ error: "toUserId and content required" }, { status: 400 });
  }

  const uid = session.userId;
  const otherId = Number(toUserId);
  if (uid === otherId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const [p1, p2] = uid < otherId ? [uid, otherId] : [otherId, uid];

  const conv = await prisma.conversation.upsert({
    where: { participant1_participant2: { participant1: p1, participant2: p2 } },
    update: { updatedAt: new Date() },
    create: { participant1: p1, participant2: p2 },
  });

  const message = await prisma.message.create({
    data: { conversationId: conv.id, senderId: uid, content: content.trim() },
  });

  // Notify recipient
  await prisma.notification.create({
    data: {
      userId:  otherId,
      title:   "New Message",
      message: `${session.email} sent you a message.`,
      type:    "message",
      link:    `/dashboard/messages`,
    },
  });

  return NextResponse.json({ conversation: conv, message }, { status: 201 });
}
