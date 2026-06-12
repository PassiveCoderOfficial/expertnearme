// File: src/app/api/dashboard/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guard";

export async function GET(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}
