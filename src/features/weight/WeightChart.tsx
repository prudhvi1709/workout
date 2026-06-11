import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "../../lib/weight";
import { shortLabel } from "../../lib/date";

interface Props {
  series: TrendPoint[];
  goalWeight?: number | null;
}

export function WeightChart({ series, goalWeight }: Props) {
  if (series.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Log a few weigh-ins to see your trend.
      </div>
    );
  }

  const weights = series.flatMap((p) => [p.daily, p.rollingAvg].filter((v): v is number => v != null));
  const min = Math.min(...weights, goalWeight ?? Infinity);
  const max = Math.max(...weights);
  const pad = Math.max(1, (max - min) * 0.1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={series} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortLabel}
          tick={{ fill: "#64748b", fontSize: 11 }}
          minTickGap={28}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
        />
        <YAxis
          domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          width={40}
          axisLine={false}
          tickLine={false}
          unit="kg"
        />
        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 12,
            color: "#e2e8f0",
          }}
          labelFormatter={(d) => shortLabel(String(d))}
          formatter={(value: number, name: string) => [`${value} kg`, name]}
        />
        {goalWeight != null && (
          <ReferenceLine
            y={goalWeight}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: `Goal ${goalWeight}kg`, fill: "#f59e0b", fontSize: 11, position: "insideTopRight" }}
          />
        )}
        {/* Daily: noisy, de-emphasized. */}
        <Line
          type="monotone"
          dataKey="daily"
          name="Daily"
          stroke="#475569"
          strokeWidth={1}
          dot={{ r: 2, fill: "#64748b" }}
          connectNulls
          isAnimationActive={false}
        />
        {/* Weekly average: light reference. */}
        <Line
          type="monotone"
          dataKey="weeklyAvg"
          name="Weekly avg"
          stroke="#38bdf8"
          strokeWidth={1.5}
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
        {/* 7-day rolling average: the primary signal. */}
        <Line
          type="monotone"
          dataKey="rollingAvg"
          name="7-day avg"
          stroke="#34d399"
          strokeWidth={3}
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
