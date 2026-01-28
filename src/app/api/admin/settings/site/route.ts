// src/app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust import if your prisma client is elsewhere
import { getSession } from "@/lib/auth"; // adjust to your auth/session helper

// GET: fetch current site settings (logo, favicon)
export async function GET() {
  try {
    const logo = await prisma.setting.findUnique({ where: { key: "site_logo" } });
    const favicon = await prisma.setting.findUnique({ where: { key: "site_favicon" } });

    return NextResponse.json({
      logo: logo?.value || null,
      favicon: favicon?.value || null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}

// POST: update site settings (admin only)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { logo, favicon } = body;

  try {
    if (logo) {
      await prisma.setting.upsert({
        where: { key: "site_logo" },
        update: { value: logo },
        create: { key: "site_logo", value: logo },
      });
    }

    if (favicon) {
      await prisma.setting.upsert({
        where: { key: "site_favicon" },
        update: { value: favicon },
        create: { key: "site_favicon", value: favicon },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save site settings" }, { status: 500 });
  }
}
