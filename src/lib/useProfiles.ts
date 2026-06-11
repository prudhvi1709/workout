import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface ProfileLite {
  id: string;
  display_name: string;
}

/**
 * All profiles (id + name), for the partner-view selector. SELECT is allowed
 * for any authenticated user under the "partner read-only" model, so this
 * returns both accounts. Read-only; no reload needed.
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("profiles")
      .select("id, display_name")
      .order("display_name", { ascending: true })
      .then(({ data }) => {
        if (active && data) setProfiles(data);
      });
    return () => {
      active = false;
    };
  }, []);

  return profiles;
}
