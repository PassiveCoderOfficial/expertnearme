import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ALLOWED = new Set(["SUPER_ADMIN", "ADMIN"]);

const CONFIG_KEYS = [
  "paddle_vendor_id",
  "paddle_api_key",
  "paddle_webhook_secret",
  "lemonsqueezy_store_id",
  "lemonsqueezy_api_key",
  "lemonsqueezy_webhook_secret",
  "surjopay_merchant_id",
  "surjopay_api_key",
  "surjopay_api_secret",
  "active_gateway",
];

export async function GET() {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: CONFIG_KEYS } },
    select: { key: true, value: true },
  });

  const config: Record<string, string> = {};
  for (const s of settings) config[s.key] = s.value;
  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body: Record<string, string> = await req.json();

  for (const key of CONFIG_KEYS) {
    if (body[key] !== undefined) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: body[key] },
        create: { key, value: body[key] },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
