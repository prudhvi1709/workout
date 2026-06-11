import { addDays, daysBetween, toISODate, parseISODate } from "./date";

export interface WeightPoint {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface TrendPoint {
  date: string;
  /** Raw morning weight on this day, if logged. */
  daily: number | null;
  /** Mean of all weigh-ins within the trailing 7 calendar days (inclusive). */
  rollingAvg: number | null;
  /** Mean weight for the calendar week this day belongs to. */
  weeklyAvg: number | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function startOfWeekISO(iso: string): string {
  // Week starts Monday. Returns the Monday on/before the given date.
  const d = parseISODate(iso);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

/**
 * Build a continuous daily trend series from sparse weigh-ins.
 *
 * The 7-day rolling average is the primary decision metric: daily weight is
 * noisy (water, food, salt), the rolling average is the real signal. It is
 * computed over a trailing 7 *calendar* day window using whatever points
 * exist in that window, so gaps in logging don't break it.
 */
export function buildWeightTrend(points: WeightPoint[]): TrendPoint[] {
  if (points.length === 0) return [];

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map(sorted.map((p) => [p.date, p.weight]));

  const first = sorted[0].date;
  const last = sorted[sorted.length - 1].date;
  const span = daysBetween(first, last);

  // weekly averages
  const weekSums = new Map<string, { sum: number; n: number }>();
  for (const p of sorted) {
    const wk = startOfWeekISO(p.date);
    const acc = weekSums.get(wk) ?? { sum: 0, n: 0 };
    acc.sum += p.weight;
    acc.n += 1;
    weekSums.set(wk, acc);
  }

  const series: TrendPoint[] = [];
  for (let i = 0; i <= span; i++) {
    const date = addDays(first, i);

    // trailing 7-day window: [date-6, date]
    let sum = 0;
    let n = 0;
    for (let k = 0; k < 7; k++) {
      const w = byDate.get(addDays(date, -k));
      if (w != null) {
        sum += w;
        n += 1;
      }
    }

    const wk = weekSums.get(startOfWeekISO(date));
    series.push({
      date,
      daily: byDate.get(date) ?? null,
      rollingAvg: n > 0 ? round1(sum / n) : null,
      weeklyAvg: wk ? round1(wk.sum / wk.n) : null,
    });
  }
  return series;
}

/** Latest available 7-day rolling average (the headline number). */
export function latestRollingAvg(series: TrendPoint[]): number | null {
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].rollingAvg != null) return series[i].rollingAvg;
  }
  return null;
}

/** Most recent raw morning weight. */
export function latestDaily(series: TrendPoint[]): number | null {
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].daily != null) return series[i].daily;
  }
  return null;
}
