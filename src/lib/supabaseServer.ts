// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

// Dummy Supabase config for build environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key";

// Only throw if actually running the server and env vars are missing
if (process.env.NODE_ENV === "production" && (!supabaseUrl || !supabaseServiceRoleKey)) {
  throw new Error(
    "Missing Supabase server env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)"
  );
}

// Server-side client using service role key (do NOT import this in client code)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
