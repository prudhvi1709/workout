import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { WorkoutSet } from "../../lib/database.types";
import type { SessionWithSets } from "./workoutStats";

/**
 * Full logged workout history for a user: sessions with their sets attached,
 * newest session first. Two flat queries joined client-side, matching
 * useLastPerformance (database.types.ts carries no relationship metadata for
 * PostgREST embedding).
 */
export function useWorkoutHistory(userId: string | undefined) {
  const [sessions, setSessions] = useState<SessionWithSets[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);

    void (async () => {
      const [sessionsRes, setsRes] = await Promise.all([
        supabase
          .from("workout_sessions")
          .select("id, session_date, day_label, notes")
          .eq("user_id", userId)
          .order("session_date", { ascending: false }),
        supabase
          .from("workout_sets")
          .select("*")
          .eq("user_id", userId)
          .order("position", { ascending: true }),
      ]);
      if (!active) return;

      const setsBySession = new Map<string, WorkoutSet[]>();
      for (const row of setsRes.data ?? []) {
        const list = setsBySession.get(row.session_id) ?? [];
        list.push(row);
        setsBySession.set(row.session_id, list);
      }

      const joined: SessionWithSets[] = (sessionsRes.data ?? []).map((s) => ({
        id: s.id,
        date: s.session_date,
        dayLabel: s.day_label,
        notes: s.notes,
        sets: setsBySession.get(s.id) ?? [],
      }));

      setSessions(joined);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  return { sessions, loading };
}
