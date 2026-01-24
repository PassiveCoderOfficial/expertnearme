//src/app/api/media/[id]/route.ts
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
    const resolvedParams = await context.params;
    const idRaw = resolvedParams?.id;
    if (!idRaw) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const id = parseInt(String(idRaw), 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session || !session.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only allow owner or admin
    if (media.uploadedById !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Attempt to delete file from disk if it exists
    try {
      const publicPath = media.url?.replace(/^\/+/, "");
      if (publicPath) {
        const filepath = path.join(process.cwd(), "public", publicPath);
        try {
          await fs.stat(filepath);
          await fs.unlink(filepath);
        } catch (fsErr) {
          console.warn(
            "File delete warning:",
            (fsErr as Error)?.message || fsErr
          );
        }
      }
    } catch (err) {
      console.error("Error deleting file from disk:", err);
      // continue to delete DB record even if file deletion fails
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/media/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
