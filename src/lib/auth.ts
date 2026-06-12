// src/lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

type SessionPayload = {
  userId: number;
  role: string;
  activeRole?: string;
  roles?: string[];
  email?: string;
};

/**
 * Resolve the current session from the signed JWT `token` cookie.
 *
 * SECURITY: auth is derived solely from the signed token. The plain
 * `userId`/`role`/`email` cookies set alongside it are NOT trusted — they
 * were forgeable and previously allowed full auth bypass.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const empty = {
    authenticated: false,
    role: "USER",
    activeRole: "USER",
    roles: ["USER"] as string[],
    userId: 0,
    email: "",
  };

  if (!token) return empty;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    if (!payload?.userId) return empty;

    const role = payload.activeRole || payload.role || "USER";
    return {
      authenticated: true,
      role,
      activeRole: role,
      roles: payload.roles?.length ? payload.roles : [role],
      userId: payload.userId,
      email: payload.email || "",
    };
  } catch {
    return empty;
  }
}
