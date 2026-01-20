// File: src/app/api/dashboard/<entity>/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}

export async function DELETE(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}

export async function PATCH(): Promise<Response> {
  return NextResponse.json({ disabled: true }, { status: 501 });
}
