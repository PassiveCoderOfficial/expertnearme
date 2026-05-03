import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  whatsapp: "+8801678669699",
  defaultTab: "manual" as const,
  tabOrder: ["lemonsqueezy", "surjopay", "manual"],
  methods: [
    { title: "bKash Personal", details: "01678-669699", icon: null },
    {
      title: "City Bank PLC (Current Account)",
      details: "Name: Passive Coder\nAccount: 1254771069001\nBranch: Uttara\nRouting: 225264634",
      icon: null,
    },
  ],
};

export async function GET() {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ["payment_whatsapp", "payment_methods", "payment_default_tab", "payment_tab_order"] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;

    let methods = DEFAULTS.methods;
    if (map["payment_methods"]) { try { methods = JSON.parse(map["payment_methods"]); } catch {} }

    let tabOrder = DEFAULTS.tabOrder;
    if (map["payment_tab_order"]) { try { tabOrder = JSON.parse(map["payment_tab_order"]); } catch {} }

    return NextResponse.json({
      whatsapp: map["payment_whatsapp"] || DEFAULTS.whatsapp,
      defaultTab: map["payment_default_tab"] || DEFAULTS.defaultTab,
      tabOrder,
      methods,
    });
  } catch (err) {
    console.error("GET /api/public/payment-config error:", err);
    return NextResponse.json(DEFAULTS);
  }
}
