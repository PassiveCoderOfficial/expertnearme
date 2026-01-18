// src/app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "emailVerificationRequired" } });
    const value = setting ? setting.value : (process.env.EMAIL_VERIFICATION_REQUIRED === "ON" ? "ON" : "OFF");
    return NextResponse.json({ ok: true, key: "emailVerificationRequired", value });
  } catch (err) {
    console.error("GET /api/admin/settings error", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { value } = body;
    if (value !== "ON" && value !== "OFF") {
      return NextResponse.json({ ok: false, error: "Invalid value" }, { status: 400 });
    }

    const upsert = await prisma.setting.upsert({
      where: { key: "emailVerificationRequired" },
      update: { value },
      create: { key: "emailVerificationRequired", value },
    });

    return NextResponse.json({ ok: true, setting: upsert });
  } catch (err) {
    console.error("PUT /api/admin/settings error", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
