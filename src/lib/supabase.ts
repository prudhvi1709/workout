import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail fast and loud: a deployed build with missing VITE_ vars silently
  // can't reach Supabase, which is otherwise painful to diagnose.
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env.local (dev) or repo secrets (CI).",
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
