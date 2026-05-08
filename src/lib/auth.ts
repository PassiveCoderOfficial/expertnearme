// src/lib/auth.ts
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();

  const role = cookieStore.get("role")?.value || "USER";
  const userId = parseInt(cookieStore.get("userId")?.value || "0", 10);
  const email = cookieStore.get("email")?.value || "";

  return {
    authenticated: !!userId,
    role,
    activeRole: role,
    userId,
    email,
  };
}
