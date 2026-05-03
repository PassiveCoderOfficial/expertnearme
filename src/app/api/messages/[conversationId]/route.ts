import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ conversationId: string }> };

// GET — load messages in a conversation
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const convId = Number(conversationId);
  const uid = session.userId;

  const conv = await prisma.conversation.findUnique({ where: { id: convId } });
  if (!conv || (conv.participant1 !== uid && conv.participant2 !== uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: convId },
    include: { sender: { select: { id: true, name: true, email: true, profile: { select: { avatar: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { conversationId: convId, senderId: { not: uid }, read: false },
    data: { read: true },
  });

  return NextResponse.json({ messages });
}

// POST — send a message in existing conversation
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const convId = Number(conversationId);
  const uid = session.userId;
  const { content } = await req.json();

  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: convId } });
  if (!conv || (conv.participant1 !== uid && conv.participant2 !== uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { conversationId: convId, senderId: uid, content: content.trim() },
    include: { sender: { select: { id: true, name: true, email: true, profile: { select: { avatar: true } } } } },
  });

  await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });

  const recipientId = conv.participant1 === uid ? conv.participant2 : conv.participant1;
  await prisma.notification.create({
    data: {
      userId:  recipientId,
      title:   "New Message",
      message: `${session.email} sent you a message.`,
      type:    "message",
      link:    `/dashboard/messages`,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
