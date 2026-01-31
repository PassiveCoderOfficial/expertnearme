// src/lib/auth.ts
import { cookies } from "next/headers";

export async function getSession() {
  // Await cookies() because your runtime expects it
  const cookieStore = await cookies();

  const role = cookieStore.get("role")?.value || "USER";
  const userId = parseInt(cookieStore.get("userId")?.value || "0", 10);
  const email = cookieStore.get("email")?.value || "";

  return {
    authenticated: !!userId,
    role,
    userId,
    email,
  };
}
