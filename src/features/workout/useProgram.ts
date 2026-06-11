import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { ProgramTemplate } from "../../lib/database.types";

export interface ProgramDay {
  dayLabel: string;
  exercises: ProgramTemplate[];
}

// Order days by their weekday prefix (Mon..Sun) rather than alphabetically.
const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function dayRank(label: string): number {
  const idx = WEEKDAY_ORDER.indexOf(label.slice(0, 3));
  return idx === -1 ? 99 : idx;
}

/** Loads the seeded program (keyed by user_id) for the given user. */
export function useProgram(userId: string | undefined) {
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);

    supabase
      .from("program_templates")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        const byDay = new Map<string, ProgramTemplate[]>();
        for (const row of data ?? []) {
          const list = byDay.get(row.day_label) ?? [];
          list.push(row);
          byDay.set(row.day_label, list);
        }
        const grouped: ProgramDay[] = [...byDay.entries()]
          .map(([dayLabel, exercises]) => ({ dayLabel, exercises }))
          .sort((a, b) => dayRank(a.dayLabel) - dayRank(b.dayLabel));
        setDays(grouped);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { days, loading };
}
