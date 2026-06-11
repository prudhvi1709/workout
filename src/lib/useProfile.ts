import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Profile } from "./database.types";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { profile, loading, reload };
}
