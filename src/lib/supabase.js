import { createClient } from "@supabase/supabase-js";

// Supabase client. Reads the project URL + anon (public) key from Vite env vars.
// The anon key is a PUBLISHABLE key meant for client code — safe to ship, gated
// by Row-Level Security. NEVER put the service_role key or DB password here.
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon && !url.includes("YOUR-PROJECT"));

export const supabase = isSupabaseConfigured ? createClient(url, anon) : null;

// Quick health check — returns true if the client can reach the project.
export async function pingSupabase() {
  if (!supabase) return false;
  const { error } = await supabase.from("news").select("id", { count: "exact", head: true });
  // A missing-table error still means we connected; only network/auth errors fail.
  return !error || error.code === "PGRST205" || error.code === "42P01";
}
