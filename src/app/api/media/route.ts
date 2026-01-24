// src/app/api/media/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { Prisma } from "@prisma/client";

const baseUploadDir = path.join(process.cwd(), "public/uploads");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "self";
  const sort = searchParams.get("sort") || "latest";

  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let where: any = {};
  if (scope === "self") {
    where = { uploadedById: session.userId };
  } else if (scope === "all" && session.role === "ADMIN") {
    // admins can see all media
    where = {};
  } else {
    // non-admins cannot request "all"
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure orderBy uses Prisma.SortOrder type
  const orderBy: Prisma.MediaOrderByWithRelationInput =
    sort === "latest"
      ? { createdAt: "desc" as Prisma.SortOrder }
      : sort === "userId"
      ? { uploadedById: "asc" as Prisma.SortOrder }
      : { filename: "asc" as Prisma.SortOrder };

  const media = await prisma.media.findMany({ where, orderBy });
  return NextResponse.json(media);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const tags = formData.get("tags") as string | null;
  const folder = session.role === "ADMIN" ? "admin" : String(session.userId);

  const uploadDir = path.join(baseUploadDir, folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  const media = await prisma.media.create({
    data: {
      url: `/uploads/${folder}/${filename}`,
      filename,
      mimetype: file.type,
      size: file.size,
      uploadedById: session.userId,
      folder,
      tags,
    },
  });

  return NextResponse.json(media);
}
