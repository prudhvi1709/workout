import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";
import { Card, StatTile } from "../components/ui";
import { useProfile } from "../lib/useProfile";
import { LogWeight } from "../features/weight/LogWeight";
import { WeightChart } from "../features/weight/WeightChart";
import { useWeightSeries } from "../features/weight/useWeightSeries";
import { latestDaily, latestRollingAvg } from "../lib/weight";

export function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile } = useProfile(userId);
  const { series, reload } = useWeightSeries(userId);

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

      <LogWeight userId={userId!} onSaved={reload} />

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
