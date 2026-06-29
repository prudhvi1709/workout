import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { shortLabel } from "../../lib/date";
import type { StrengthPoint, WeekStat } from "./workoutStats";

const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  color: "#e2e8f0",
} as const;

const AXIS_TICK = { fill: "#64748b", fontSize: 11 } as const;

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

/** Estimated-1RM (primary) and top-set weight (secondary) for one lift over time. */
export function StrengthChart({ points }: { points: StrengthPoint[] }) {
  if (points.length === 0) {
    return <EmptyChart message="No logged sets with a load for this exercise yet." />;
  }
  const values = points.flatMap((p) => [p.weight, p.e1rm]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(2, (max - min) * 0.15);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortLabel}
          tick={AXIS_TICK}
          minTickGap={24}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
        />
        <YAxis
          domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
          tick={AXIS_TICK}
          width={40}
          axisLine={false}
          tickLine={false}
          unit="kg"
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={(d) => shortLabel(String(d))}
          formatter={(value: number, name: string) => [`${value} kg`, name]}
        />
        <Line
          type="monotone"
          dataKey="weight"
          name="Top-set weight"
          stroke="#64748b"
          strokeWidth={1.5}
          dot={{ r: 2, fill: "#64748b" }}
          connectNulls
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="e1rm"
          name="Est. 1RM"
          stroke="#34d399"
          strokeWidth={3}
          dot={{ r: 3, fill: "#34d399" }}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Per-week sessions or training volume (tonnage). */
export function WeeklyChart({ weeks, metric }: { weeks: WeekStat[]; metric: "sessions" | "volume" }) {
  if (weeks.length === 0) {
    return <EmptyChart message="No sessions logged yet." />;
  }
  const isVolume = metric === "volume";
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={weeks} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="weekStart"
          tickFormatter={shortLabel}
          tick={AXIS_TICK}
          minTickGap={20}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
        />
        <YAxis
          tick={AXIS_TICK}
          width={44}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (isVolume ? `${Math.round(v / 1000)}k` : String(v))}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={(d) => `Week of ${shortLabel(String(d))}`}
          formatter={(value: number) =>
            isVolume ? [`${value.toLocaleString()} kg`, "Volume"] : [`${value}`, "Sessions"]
          }
        />
        <Bar
          dataKey={isVolume ? "volume" : "sessions"}
          fill="#38bdf8"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
