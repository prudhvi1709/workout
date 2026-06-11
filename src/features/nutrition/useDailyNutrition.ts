import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export interface DailyNutrition {
  calories: number | null;
  protein_g: number | null;
}

/**
 * One day's logged calories + protein for a user (null if nothing logged that
 * day). Used to show intake vs target read-only on the dashboard.
 */
export function useDailyNutrition(userId: string | undefined, date: string): DailyNutrition | null {
  const [data, setData] = useState<DailyNutrition | null>(null);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }
    let active = true;
    supabase
      .from("daily_logs")
      .select("calories, protein_g")
      .eq("user_id", userId)
      .eq("log_date", date)
      .maybeSingle()
      .then(({ data: row }) => {
        if (!active) return;
        setData(row ? { calories: row.calories, protein_g: row.protein_g } : null);
      });
    return () => {
      active = false;
    };
  }, [userId, date]);

  return data;
}
