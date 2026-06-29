// Pure derivations over logged workout history. No I/O, no React - so the
// numbers a coach sees are easy to reason about and test. A "logged set" row
// (workout_sets) is one exercise entry in a session: weight_kg, sets (count),
// reps (per set), rir.

import type { WorkoutSet } from "../../lib/database.types";
import { daysBetween, parseISODate, toISODate } from "../../lib/date";

export interface SessionWithSets {
  id: string;
  date: string; // session_date, ISO YYYY-MM-DD
  dayLabel: string | null;
  notes: string | null;
  sets: WorkoutSet[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Epley estimated 1-rep-max. Only meaningful when weight and reps are present. */
export function estimate1RM(weightKg: number, reps: number): number {
  return round1(weightKg * (1 + reps / 30));
}

/** Total tonnage for one logged row: sets x reps x weight (kg). 0 if no load. */
export function setVolume(s: WorkoutSet): number {
  if (s.weight_kg == null || s.reps == null) return 0;
  const sets = s.sets ?? 1;
  return sets * s.reps * s.weight_kg;
}

/** True for rows that carry a real load (excludes warm-ups, cardio, mobility). */
export function isLoadedSet(s: WorkoutSet): boolean {
  return s.weight_kg != null && s.weight_kg > 0 && s.reps != null && s.reps > 0;
}

/** Monday on/before the given date (weeks start Monday), as ISO. */
export function weekStartISO(iso: string): string {
  const d = parseISODate(iso);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

// --- Strength progression --------------------------------------------------

export interface StrengthPoint {
  date: string;
  /** Heaviest top-set weight logged for the exercise that day. */
  weight: number;
  /** Estimated 1RM from that set (Epley). */
  e1rm: number;
  reps: number | null;
}

/**
 * One point per session in which the exercise was logged with a real load,
 * oldest first. When a session has multiple rows for the exercise we keep the
 * one with the highest estimated 1RM (the best working effort that day).
 */
export function exerciseProgression(
  sessions: SessionWithSets[],
  exerciseName: string,
): StrengthPoint[] {
  const byDate = new Map<string, StrengthPoint>();
  for (const session of sessions) {
    for (const s of session.sets) {
      if (s.exercise_name !== exerciseName || !isLoadedSet(s)) continue;
      const e1rm = estimate1RM(s.weight_kg as number, s.reps as number);
      const prev = byDate.get(session.date);
      if (!prev || e1rm > prev.e1rm) {
        byDate.set(session.date, { date: session.date, weight: s.weight_kg as number, e1rm, reps: s.reps });
      }
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface ExerciseFreq {
  name: string;
  sessions: number; // number of sessions it appears in (loaded)
}

/** Loaded exercises ranked by how many sessions they appear in (most trained first). */
export function loadedExercises(sessions: SessionWithSets[]): ExerciseFreq[] {
  const count = new Map<string, number>();
  for (const session of sessions) {
    const seen = new Set<string>();
    for (const s of session.sets) {
      if (!isLoadedSet(s) || seen.has(s.exercise_name)) continue;
      seen.add(s.exercise_name);
      count.set(s.exercise_name, (count.get(s.exercise_name) ?? 0) + 1);
    }
  }
  return [...count.entries()]
    .map(([name, sessions]) => ({ name, sessions }))
    .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name));
}

// --- Weekly aggregates -----------------------------------------------------

export interface WeekStat {
  weekStart: string;
  sessions: number;
  volume: number; // total tonnage (kg)
  sets: number; // total working sets
}

/** Per-week session count, tonnage and set count, oldest week first. */
export function weeklyStats(sessions: SessionWithSets[]): WeekStat[] {
  const byWeek = new Map<string, WeekStat>();
  for (const session of sessions) {
    const wk = weekStartISO(session.date);
    const acc = byWeek.get(wk) ?? { weekStart: wk, sessions: 0, volume: 0, sets: 0 };
    acc.sessions += 1;
    for (const s of session.sets) {
      acc.volume += setVolume(s);
      if (isLoadedSet(s)) acc.sets += s.sets ?? 1;
    }
    byWeek.set(wk, acc);
  }
  return [...byWeek.values()]
    .map((w) => ({ ...w, volume: Math.round(w.volume) }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

// --- Headline summary ------------------------------------------------------

export interface TrainingSummary {
  total: number;
  last7: number;
  last30: number;
  perWeek: number | null; // sessions/week over the active span
  totalVolume: number; // kg
  firstDate: string | null;
  lastDate: string | null;
}

export function trainingSummary(sessions: SessionWithSets[], todayISO: string): TrainingSummary {
  if (sessions.length === 0) {
    return { total: 0, last7: 0, last30: 0, perWeek: null, totalVolume: 0, firstDate: null, lastDate: null };
  }
  const dates = sessions.map((s) => s.date).sort((a, b) => a.localeCompare(b));
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const last7 = sessions.filter((s) => daysBetween(s.date, todayISO) <= 7 && daysBetween(s.date, todayISO) >= 0).length;
  const last30 = sessions.filter((s) => daysBetween(s.date, todayISO) <= 30 && daysBetween(s.date, todayISO) >= 0).length;
  const spanDays = Math.max(1, daysBetween(firstDate, lastDate));
  const perWeek = round1(sessions.length / Math.max(1, spanDays / 7));
  const totalVolume = Math.round(
    sessions.reduce((sum, s) => sum + s.sets.reduce((a, x) => a + setVolume(x), 0), 0),
  );
  return { total: sessions.length, last7, last30, perWeek, totalVolume, firstDate, lastDate };
}

// --- Routine adherence -----------------------------------------------------

export interface DayAdherence {
  dayLabel: string;
  count: number;
  lastDate: string | null;
}

/** How many sessions per program day-label, most-recent date for each. */
export function dayAdherence(sessions: SessionWithSets[]): DayAdherence[] {
  const byDay = new Map<string, DayAdherence>();
  for (const session of sessions) {
    const label = session.dayLabel ?? "Unlabelled";
    const acc = byDay.get(label) ?? { dayLabel: label, count: 0, lastDate: null };
    acc.count += 1;
    if (!acc.lastDate || session.date > acc.lastDate) acc.lastDate = session.date;
    byDay.set(label, acc);
  }
  return [...byDay.values()].sort((a, b) => b.count - a.count);
}

/** Program lifts (with a set/rep target) that have never been logged with load. */
export function neverLogged(programLifts: string[], sessions: SessionWithSets[]): string[] {
  const logged = new Set<string>();
  for (const session of sessions) {
    for (const s of session.sets) {
      if (isLoadedSet(s)) logged.add(s.exercise_name);
    }
  }
  return programLifts.filter((name) => !logged.has(name));
}

// --- Auto coaching brief ---------------------------------------------------

export interface Insight {
  kind: "good" | "watch" | "info";
  text: string;
}

export interface ExerciseTrend {
  name: string;
  sessions: number;
  firstE1rm: number;
  lastE1rm: number;
  changePct: number;
  stalled: boolean; // no e1RM gain across the last 3 sessions
}

/** e1RM trend per exercise that has at least 2 loaded sessions. */
export function exerciseTrends(sessions: SessionWithSets[]): ExerciseTrend[] {
  const out: ExerciseTrend[] = [];
  for (const { name } of loadedExercises(sessions)) {
    const pts = exerciseProgression(sessions, name);
    if (pts.length < 2) continue;
    // Compare BEST effort early vs BEST effort recently (2-session windows), not
    // single endpoints - so one light warm-up or deload session can't fake a big
    // gain or a crash. The raw per-session points are still on the chart.
    const head = pts.slice(0, Math.min(2, pts.length));
    const tail = pts.slice(-2);
    const earlyBest = Math.max(...head.map((p) => p.e1rm));
    const recentBest = Math.max(...tail.map((p) => p.e1rm));
    const changePct = earlyBest > 0 ? round1(((recentBest - earlyBest) / earlyBest) * 100) : 0;
    const recent3 = pts.slice(-3);
    const stalled = recent3.length >= 3 && Math.max(...recent3.map((p) => p.e1rm)) <= recent3[0].e1rm;
    out.push({ name, sessions: pts.length, firstE1rm: earlyBest, lastE1rm: recentBest, changePct, stalled });
  }
  return out;
}

/**
 * A short, plain-language brief for a coach: consistency, biggest gains,
 * stalls, gaps, and the weight-vs-strength story (the cut's whole point).
 */
export function buildInsights(
  sessions: SessionWithSets[],
  programLifts: string[],
  summary: TrainingSummary,
  weight: { startAvg: number | null; latestAvg: number | null } | null,
): Insight[] {
  const insights: Insight[] = [];
  if (sessions.length === 0) return insights;

  // Consistency
  if (summary.perWeek != null) {
    const freqKind = summary.perWeek >= 3 ? "good" : summary.perWeek >= 2 ? "info" : "watch";
    insights.push({
      kind: freqKind,
      text: `Training ~${summary.perWeek}x/week (${summary.last30} sessions in the last 30 days).`,
    });
  }

  // In a deficit, holding strength IS success (muscle retention), so a flat lift
  // is not a problem to "fix" - only a genuine drop is. When not cutting, you'd
  // expect to add load, so a plateau is worth surfacing. Keyed off the weight
  // trend rather than a hard-coded goal, so it adapts per person.
  const inDeficit =
    weight != null && weight.startAvg != null && weight.latestAvg != null && weight.startAvg - weight.latestAvg > 0.5;

  const trends = exerciseTrends(sessions);

  // Biggest gains (top 3 by % e1RM increase, only real gains)
  const gains = trends.filter((t) => t.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 3);
  for (const g of gains) {
    insights.push({
      kind: "good",
      text: `${g.name}: est. 1RM ${g.firstE1rm} -> ${g.lastE1rm} kg (+${g.changePct}%) over ${g.sessions} sessions.`,
    });
  }

  // Regressions: strength actually slipping - always worth a look, framed by goal.
  // Threshold kept generous so noisy single sessions don't trip it.
  const regressing = trends.filter((t) => t.changePct <= -5).sort((a, b) => a.changePct - b.changePct).slice(0, 4);
  for (const r of regressing) {
    insights.push({
      kind: "watch",
      text: `${r.name}: est. 1RM down ${Math.abs(r.changePct)}% (${r.firstE1rm} -> ${r.lastE1rm} kg)${
        inDeficit ? " - if it keeps slipping, the deficit may be too steep or protein too low." : " - check load, form or recovery."
      }`,
    });
  }

  // Plateaus (flat, not dropping). Only a concern when NOT cutting - in a deficit
  // a held lift is the retention win, covered by the weight-vs-strength insight.
  if (!inDeficit) {
    const stalled = trends.filter((t) => t.stalled && t.changePct > -5).slice(0, 4);
    for (const s of stalled) {
      insights.push({
        kind: "watch",
        text: `${s.name}: no est. 1RM gain across the last 3 sessions - may be plateauing, consider a load/technique tweak.`,
      });
    }
  }

  // Program lifts never logged
  const missing = neverLogged(programLifts, sessions);
  if (missing.length > 0) {
    insights.push({
      kind: "watch",
      text: `In the program but never logged: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "..." : ""}.`,
    });
  }

  // The cut story: weight down + strength holding/up = muscle retained
  if (weight && weight.startAvg != null && weight.latestAvg != null) {
    const dropped = round1(weight.startAvg - weight.latestAvg);
    const strengthHeld = gains.length > 0 || trends.some((t) => t.changePct >= 0);
    if (dropped > 0 && strengthHeld) {
      insights.push({
        kind: "good",
        text: `Body-weight avg down ${dropped} kg while strength held or climbed - muscle retention on track for the cut.`,
      });
    } else if (dropped > 0 && !strengthHeld) {
      insights.push({
        kind: "watch",
        text: `Body-weight avg down ${dropped} kg but lifts are slipping - deficit may be too steep or protein too low.`,
      });
    }
  }

  return insights;
}
