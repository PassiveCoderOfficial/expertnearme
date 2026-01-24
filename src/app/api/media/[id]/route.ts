// src/app/api/media/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const parsedId = parseInt(String(id), 10);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || !session.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const media = await prisma.media.findUnique({ where: { id: parsedId } });
    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (media.uploadedById !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const publicPath = media.url?.replace(/^\/+/, "");
      if (publicPath) {
        const filepath = path.join(process.cwd(), "public", publicPath);
        try {
          await fs.stat(filepath);
          await fs.unlink(filepath);
        } catch (fsErr) {
          console.warn("File delete warning:", (fsErr as Error)?.message || fsErr);
        }
      }
    } catch (err) {
      console.error("Error deleting file from disk:", err);
    }

    await prisma.media.delete({ where: { id: parsedId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/media/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
