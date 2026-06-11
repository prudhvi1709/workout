import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { buildWeightTrend, type TrendPoint, type WeightPoint } from "../../lib/weight";

export function useWeightSeries(userId: string | undefined) {
  const [series, setSeries] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("daily_logs")
      .select("log_date, morning_weight_kg")
      .eq("user_id", userId)
      .not("morning_weight_kg", "is", null)
      .order("log_date", { ascending: true });

    if (!error && data) {
      const points: WeightPoint[] = data
        .filter((r) => r.morning_weight_kg != null)
        .map((r) => ({ date: r.log_date as string, weight: Number(r.morning_weight_kg) }));
      setSeries(buildWeightTrend(points));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { series, loading, reload };
}
