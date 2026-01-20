// src/app/api/dashboard/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBoolean, setSetting } from "@/lib/settings";

export async function GET(): Promise<Response> {
  try {
    const emailVerificationRequired = await getBoolean("emailVerificationRequired", true);
    const allowGoogleLogin = await getBoolean("allowGoogleLogin", true);
    const allowSignup = await getBoolean("allowSignup", true);

    return NextResponse.json({
      emailVerificationRequired,
      allowGoogleLogin,
      allowSignup,
    });
  } catch (err: any) {
    console.error("GET /dashboard/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<Response> {
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

    const emailVerificationRequired = await getBoolean("emailVerificationRequired", true);
    const allowGoogleLogin = await getBoolean("allowGoogleLogin", true);
    const allowSignup = await getBoolean("allowSignup", true);

    return NextResponse.json({
      emailVerificationRequired,
      allowGoogleLogin,
      allowSignup,
    });
  } catch (err: any) {
    console.error("PATCH /dashboard/settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
