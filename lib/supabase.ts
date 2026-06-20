import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service_role key.
 * RLS is enabled on every table with no anon policies, so the registry is
 * locked down by default — all reads/writes happen here, server-side.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

export function getServiceClient() {
  if (!serviceRoleKey || serviceRoleKey === "PASTE_SERVICE_ROLE_KEY_HERE") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add the service_role key from the Supabase dashboard to .env.local."
    );
  }
  return createClient(url!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
