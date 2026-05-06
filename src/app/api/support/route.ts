import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, type, subject, description } = body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const session = await getSession();

  const ticket = await prisma.supportTicket.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type: type || "OTHER",
      subject: subject.trim(),
      description: description.trim(),
      userId: session.authenticated ? session.userId : null,
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
