import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    // Skip Supabase deletion for build (no env vars)
    // await deleteFromSupabase(media);

    await prisma.media.delete({ where: { id: parsedId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/media/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Commented out Supabase deletion for build without env vars
// async function deleteFromSupabase(media: any) {
//   if (media.folder && media.filename) {
//     const path = `${media.folder}/${media.filename}`;
//     const { error } = await supabaseServer.storage
//       .from("uploads")
//       .remove([path]);
//     if (error) {
//       console.warn("Supabase delete warning:", error.message || error);
//     }
//   }
// }
