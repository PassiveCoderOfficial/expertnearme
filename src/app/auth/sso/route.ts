import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SSO_SECRET = process.env.SSO_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

interface SSOPayload {
  userId: number;
  email: string;
  role: string;
  type: string;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const redirectTo = req.nextUrl.searchParams.get("redirect") || "/dashboard";

  const failUrl = new URL("/login?error=sso_failed", req.url);

  if (!token || !SSO_SECRET) {
    return NextResponse.redirect(failUrl);
  }

  let payload: SSOPayload;
  try {
    payload = jwt.verify(token, SSO_SECRET) as SSOPayload;
  } catch {
    return NextResponse.redirect(failUrl);
  }

  // Reject if type claim missing or wrong — prevents session tokens being used here
  if (payload.type !== "sso") {
    return NextResponse.redirect(failUrl);
  }

  // Issue a full session JWT (7d) using JWT_SECRET, same as normal login
  const sessionToken = jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      activeRole: payload.role,
      roles: [payload.role],
      email: payload.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
  const res = NextResponse.redirect(new URL(safeRedirect, req.url));

  const cookieOpts = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  };

  res.cookies.set("token", sessionToken, cookieOpts);
  res.cookies.set("userId", String(payload.userId), { ...cookieOpts, httpOnly: false });
  res.cookies.set("email", payload.email, { ...cookieOpts, httpOnly: false });
  res.cookies.set("role", payload.role, { ...cookieOpts, httpOnly: false });

  return res;
}
