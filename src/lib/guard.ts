// src/lib/guard.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "MARKETER",
  "SEO_EXPERT",
] as const;

type Session = Awaited<ReturnType<typeof getSession>>;

/**
 * Require an authenticated session. Returns the session, or a 401 response.
 * Usage:
 *   const gate = await requireAuth();
 *   if (gate instanceof NextResponse) return gate;
 *   const session = gate;
 */
export async function requireAuth(): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

/**
 * Require an authenticated session whose active role is in `allowed`.
 * Defaults to staff/admin roles. Returns the session, or a 401/403 response.
 */
export async function requireRole(
  allowed: readonly string[] = ADMIN_ROLES
): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roles = session.roles?.length ? session.roles : [session.role];
  const ok = roles.some((r) => allowed.includes(r)) || allowed.includes(session.role);
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
