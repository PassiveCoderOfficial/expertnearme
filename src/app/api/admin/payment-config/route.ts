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

const MANUAL_KEYS = ["payment_whatsapp", "payment_methods", "payment_default_tab", "payment_tab_order"];

export async function GET() {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: [...CONFIG_KEYS, ...MANUAL_KEYS] } },
    select: { key: true, value: true },
  });

  const config: Record<string, string> = {};
  for (const s of settings) config[s.key] = s.value;

  let paymentMethods = [];
  if (config["payment_methods"]) { try { paymentMethods = JSON.parse(config["payment_methods"]); } catch {} }
  let tabOrder = ["lemonsqueezy", "surjopay", "manual"];
  if (config["payment_tab_order"]) { try { tabOrder = JSON.parse(config["payment_tab_order"]); } catch {} }

  return NextResponse.json({
    config,
    manual: {
      whatsapp: config["payment_whatsapp"] || "",
      methods: paymentMethods,
      defaultTab: config["payment_default_tab"] || "manual",
      tabOrder,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !ALLOWED.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body: Record<string, string> = await req.json();

  const allKeys = [...CONFIG_KEYS, ...MANUAL_KEYS];
  const upserts: Promise<unknown>[] = [];

  for (const key of allKeys) {
    if (body[key] !== undefined) {
      upserts.push(prisma.setting.upsert({
        where: { key },
        update: { value: String(body[key]) },
        create: { key, value: String(body[key]) },
      }));
    }
  }

  await Promise.all(upserts);
  return NextResponse.json({ ok: true });
}
