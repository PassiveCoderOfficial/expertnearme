// File: src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true, message: "Logged out" });
  res.cookies.set({
    name: "token",
    value: "",
    path: "/",
    maxAge: 0, // expire immediately
  });
  return res;
}
