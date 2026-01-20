// File: src/app/api/dashboard/categories/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}
