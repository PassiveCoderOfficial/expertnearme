// File: src/app/api/slug/check/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim();
    if (!slug) return NextResponse.json({ ok: false, error: "missing slug" }, { status: 400 });

    const found = await prisma.expert.findUnique({ where: { profileLink: slug } });
    return NextResponse.json({ ok: true, taken: !!found });
  } catch (err: any) {
    console.error("GET /api/slug/check error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
