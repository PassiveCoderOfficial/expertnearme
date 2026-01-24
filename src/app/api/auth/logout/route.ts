// File: src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true, message: "Logged out" });

  // ✅ Clear all cookies set during login
  res.cookies.set("token", "", { path: "/", maxAge: 0 });
  res.cookies.set("userId", "", { path: "/", maxAge: 0 });
  res.cookies.set("email", "", { path: "/", maxAge: 0 });
  res.cookies.set("role", "", { path: "/", maxAge: 0 });

  return res;
}
