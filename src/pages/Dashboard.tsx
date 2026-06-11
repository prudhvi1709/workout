import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";
import { Card, StatTile } from "../components/ui";
import { useProfile } from "../lib/useProfile";
import { useProfiles } from "../lib/useProfiles";
import { todayISO } from "../lib/date";
import { LogWeight } from "../features/weight/LogWeight";
import { WeightChart } from "../features/weight/WeightChart";
import { useWeightSeries } from "../features/weight/useWeightSeries";
import { NutritionProgress } from "../features/nutrition/NutritionProgress";
import { useDailyNutrition } from "../features/nutrition/useDailyNutrition";
import { latestDaily, latestRollingAvg } from "../lib/weight";

export function Dashboard() {
  const { user } = useAuth();
  const profiles = useProfiles();

  // Whose data we're viewing. Defaults to self; switching to a partner is
  // read-only (writes stay owner-only at the RLS layer, and we hide the form).
  const [viewerId, setViewerId] = useState<string | undefined>(undefined);
  const activeId = viewerId ?? user?.id;
  const isSelf = activeId === user?.id;

  const { profile } = useProfile(activeId);
  const { series, reload } = useWeightSeries(activeId);
  const today = useDailyNutrition(activeId, todayISO());

  const avg = latestRollingAvg(series);
  const daily = latestDaily(series);
  const goal = profile?.goal_weight_kg ?? null;
  const start = profile?.start_weight_kg ?? null;

  // Progress measured against the 7-day average, not noisy daily weight.
  let progressPct: number | null = null;
  if (avg != null && goal != null && start != null && start !== goal) {
    progressPct = Math.round(((start - avg) / (start - goal)) * 100);
  }

  return (
    <Layout title={profile ? `${profile.display_name}'s Recomp` : "Recomp Tracker"}>
      {profiles.length > 1 && (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1 rounded-xl bg-slate-800/60 p-1 ring-1 ring-slate-700/50">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setViewerId(p.id)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  p.id === activeId
                    ? "bg-emerald-500 text-slate-900"
                    : "text-slate-300 hover:text-slate-100"
                }`}
              >
                {p.id === user?.id ? "Me" : p.display_name}
              </button>
            ))}
          </div>
          {!isSelf && (
            <span className="rounded-lg bg-slate-800/60 px-2 py-1 text-xs text-slate-400 ring-1 ring-slate-700/50">
              Read-only
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="7-day avg"
          value={avg != null ? `${avg} kg` : "--"}
          sub={daily != null ? `latest ${daily} kg` : "no data yet"}
        />
        <StatTile label="Goal" value={goal != null ? `${goal} kg` : "--"} />
        <StatTile
          label="To go"
          value={avg != null && goal != null ? `${Math.max(0, Math.round((avg - goal) * 10) / 10)} kg` : "--"}
        />
        <StatTile label="Progress" value={progressPct != null ? `${progressPct}%` : "--"} />
      </div>

      {isSelf ? (
        <LogWeight userId={user!.id} onSaved={reload} />
      ) : (
        <NutritionProgress
          calories={today?.calories ?? null}
          calorieTarget={profile?.calorie_target ?? null}
          protein={today?.protein_g ?? null}
          proteinTarget={profile?.protein_target_g ?? null}
        />
      )}

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Weight trend
        </h2>
        <WeightChart series={series} goalWeight={goal} />
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
          <Legend color="#34d399" label="7-day avg (primary)" />
          <Legend color="#38bdf8" label="Weekly avg" />
          <Legend color="#64748b" label="Daily" />
        </div>
      </Card>
    </Layout>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2 w-4 rounded" style={{ background: color }} />
      {label}
    </span>
  );
}
