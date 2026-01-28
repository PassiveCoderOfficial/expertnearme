// File: src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getBoolean, setSetting } from "@/lib/settings";

export async function GET() {
  try {
    // booleans
    const emailVerificationRequired = await getBoolean("emailVerificationRequired", true);
    const allowGoogleLogin = await getBoolean("allowGoogleLogin", true);
    const allowSignup = await getBoolean("allowSignup", true);

    // logo + favicon
    const logo = await prisma.setting.findUnique({ where: { key: "site_logo" } });
    const favicon = await prisma.setting.findUnique({ where: { key: "site_favicon" } });

    return NextResponse.json({
      emailVerificationRequired,
      allowGoogleLogin,
      allowSignup,
      logo: logo?.value || null,
      favicon: favicon?.value || null,
    });
  } catch (err) {
    console.error("GET /admin/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.emailVerificationRequired !== undefined) {
      await setSetting("emailVerificationRequired", String(body.emailVerificationRequired));
    }
    if (body.allowGoogleLogin !== undefined) {
      await setSetting("allowGoogleLogin", String(body.allowGoogleLogin));
    }
    if (body.allowSignup !== undefined) {
      await setSetting("allowSignup", String(body.allowSignup));
    }

    // update logo/favicon if provided
    if (body.logo) {
      await prisma.setting.upsert({
        where: { key: "site_logo" },
        update: { value: body.logo },
        create: { key: "site_logo", value: body.logo },
      });
    }
    if (body.favicon) {
      await prisma.setting.upsert({
        where: { key: "site_favicon" },
        update: { value: body.favicon },
        create: { key: "site_favicon", value: body.favicon },
      });
    }

    // return updated values
    const emailVerificationRequired = await getBoolean("emailVerificationRequired", true);
    const allowGoogleLogin = await getBoolean("allowGoogleLogin", true);
    const allowSignup = await getBoolean("allowSignup", true);
    const logo = await prisma.setting.findUnique({ where: { key: "site_logo" } });
    const favicon = await prisma.setting.findUnique({ where: { key: "site_favicon" } });

    return NextResponse.json({
      emailVerificationRequired,
      allowGoogleLogin,
      allowSignup,
      logo: logo?.value || null,
      favicon: favicon?.value || null,
    });
  } catch (err) {
    console.error("PATCH /admin/settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
