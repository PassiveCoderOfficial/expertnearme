// src/app/api/media/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { slugify, splitNameExt, getUniqueFilename } from "@/lib/filename";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") || "self") as "self" | "all";
  const sort = searchParams.get("sort") || "latest";

  const session = await getSession();
  if (!session || !session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let where: any = {};
  if (scope === "self") {
    where = { uploadedById: session.userId };
  } else if (scope === "all" && session.role === "ADMIN") {
    where = {};
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Explicitly type orderBy so Prisma's types are satisfied
  const orderBy: Prisma.MediaOrderByWithRelationInput =
    sort === "latest"
      ? { createdAt: "desc" }
      : sort === "userId"
      ? { uploadedById: "asc" }
      : { filename: "asc" };

  const media = await prisma.media.findMany({ where, orderBy });
  return NextResponse.json(media);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const tags = (formData.get("tags") as string) || null;
  const accountSlug =
    (session as any).profile?.slug ||
    (session as any).slug ||
    `user-${session.userId}`;
  const folder = session.role === "ADMIN" ? "admin" : String(accountSlug);

  const { base, ext } = splitNameExt(file.name);
  const sanitizedBase = slugify(base);
  const sanitizedSlug = slugify(String(accountSlug));
  const baseName = `${sanitizedSlug}-${sanitizedBase}`;

  const bucket = "uploads";
  const uniqueFilename = await getUniqueFilename(
    supabaseServer,
    bucket,
    folder,
    baseName,
    ext
  );

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseServer.storage
    .from(bucket)
    .upload(`${folder}/${uniqueFilename}`, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: publicData } = supabaseServer.storage
    .from(bucket)
    .getPublicUrl(`${folder}/${uniqueFilename}`);
  const publicUrl = publicData?.publicUrl ?? "";

  const media = await prisma.media.create({
    data: {
      url: publicUrl,
      filename: uniqueFilename,
      mimetype: file.type,
      size: file.size,
      uploadedById: session.userId,
      folder,
      tags,
    },
  });

  return NextResponse.json(media);
}
