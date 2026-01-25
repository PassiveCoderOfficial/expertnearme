// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase server env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)"
  );
}

// Server-side client using service role key (do NOT import this in client code)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
