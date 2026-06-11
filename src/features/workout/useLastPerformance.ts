import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { LastPerformance } from "./progression";

/**
 * Most recent logged set per exercise for the user, keyed by exercise_name.
 * Used to prefill weights and show an advisory progression hint in the logger.
 *
 * Done as two flat queries (sessions + sets) joined client-side rather than an
 * embedded select, because database.types.ts is hand-authored and carries no
 * relationship metadata for PostgREST resource embedding.
 */
export function useLastPerformance(userId: string | undefined) {
  const [byExercise, setByExercise] = useState<Map<string, LastPerformance>>(new Map());

  useEffect(() => {
    if (!userId) return;
    let active = true;

    void (async () => {
      const [sessionsRes, setsRes] = await Promise.all([
        supabase.from("workout_sessions").select("id, session_date").eq("user_id", userId),
        supabase
          .from("workout_sets")
          .select("exercise_name, weight_kg, reps, sets, session_id")
          .eq("user_id", userId),
      ]);
      if (!active) return;

      const dateBySession = new Map<string, string>();
      for (const s of sessionsRes.data ?? []) dateBySession.set(s.id, s.session_date);

      const latest = new Map<string, LastPerformance>();
      for (const row of setsRes.data ?? []) {
        const date = dateBySession.get(row.session_id);
        if (!date) continue;
        const prev = latest.get(row.exercise_name);
        // session_date is ISO YYYY-MM-DD, so lexicographic compare == chronological.
        if (!prev || date > prev.sessionDate) {
          latest.set(row.exercise_name, {
            weightKg: row.weight_kg,
            reps: row.reps,
            sets: row.sets,
            sessionDate: date,
          });
        }
      }
      setByExercise(latest);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  return byExercise;
}
