import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";
import { Card, StatTile } from "../components/ui";
import { useProfile } from "../lib/useProfile";
import { useProfiles } from "../lib/useProfiles";
import { useWeightSeries } from "../features/weight/useWeightSeries";
import { latestRollingAvg } from "../lib/weight";
import { useProgram } from "../features/workout/useProgram";
import { useWorkoutHistory } from "../features/workout/useWorkoutHistory";
import { StrengthChart, WeeklyChart } from "../features/workout/WorkoutCharts";
import { shortLabel, todayISO } from "../lib/date";
import {
  buildInsights,
  dayAdherence,
  exerciseProgression,
  isLoadedSet,
  loadedExercises,
  neverLogged,
  trainingSummary,
  weeklyStats,
} from "../features/workout/workoutStats";

const formatVolume = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${kg} kg`);

export function Progress() {
  const { user } = useAuth();
  const profiles = useProfiles();

  const [viewerId, setViewerId] = useState<string | undefined>(undefined);
  const activeId = viewerId ?? user?.id;

  const { profile } = useProfile(activeId);
  const { sessions, loading } = useWorkoutHistory(activeId);
  const { days } = useProgram(activeId);
  const { series } = useWeightSeries(activeId);

  const [pickedExercise, setPickedExercise] = useState<string | null>(null);
  const [weeklyMetric, setWeeklyMetric] = useState<"sessions" | "volume">("sessions");

  // Reset the chosen exercise when switching whose data we view.
  const exercises = useMemo(() => loadedExercises(sessions), [sessions]);
  const selected = pickedExercise && exercises.some((e) => e.name === pickedExercise)
    ? pickedExercise
    : (exercises[0]?.name ?? null);

  const summary = useMemo(() => trainingSummary(sessions, todayISO()), [sessions]);
  const weeks = useMemo(() => weeklyStats(sessions), [sessions]);
  const adherence = useMemo(() => dayAdherence(sessions), [sessions]);
  const progression = useMemo(
    () => (selected ? exerciseProgression(sessions, selected) : []),
    [sessions, selected],
  );

  // Only consider lifts from program days actually trained at least once. A
  // brand-new day you haven't done yet shouldn't show up as "never logged".
  const programLifts = useMemo(() => {
    const trainedDays = new Set(sessions.map((s) => s.dayLabel));
    const names = days
      .flatMap((d) => d.exercises)
      .filter((e) => e.target_sets != null && trainedDays.has(e.day_label))
      .map((e) => e.exercise_name);
    return [...new Set(names)];
  }, [days, sessions]);
  const missing = useMemo(() => neverLogged(programLifts, sessions), [programLifts, sessions]);

  const startAvg = series.find((p) => p.rollingAvg != null)?.rollingAvg ?? null;
  const latestAvg = latestRollingAvg(series);

  const insights = useMemo(
    () => buildInsights(sessions, programLifts, summary, { startAvg, latestAvg }),
    [sessions, programLifts, summary, startAvg, latestAvg],
  );

  const firstPt = progression[0];
  const lastPt = progression[progression.length - 1];

  return (
    <Layout title={profile ? `${profile.display_name}'s Progress` : "Progress"}>
      {profiles.length > 1 && (
        <div className="flex flex-1 gap-1 rounded-xl bg-slate-800/60 p-1 ring-1 ring-slate-700/50">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setViewerId(p.id);
                setPickedExercise(null);
              }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                p.id === activeId ? "bg-emerald-500 text-slate-900" : "text-slate-300 hover:text-slate-100"
              }`}
            >
              {p.id === user?.id ? "Me" : p.display_name}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Loading workout history...</p>}

      {!loading && sessions.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">
            No workouts logged yet. Log a session on the Workout tab and your progress will show up here.
          </p>
        </Card>
      )}

      {!loading && sessions.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              label="Sessions"
              value={summary.total}
              sub={summary.firstDate ? `since ${shortLabel(summary.firstDate)}` : undefined}
            />
            <StatTile label="Last 7 days" value={summary.last7} sub="sessions" />
            <StatTile label="Per week" value={summary.perWeek ?? "--"} sub="avg over span" />
            <StatTile label="Total volume" value={formatVolume(summary.totalVolume)} sub="all sessions" />
          </div>

          {/* Auto coaching brief - the intelligent summary to talk through. */}
          {insights.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                Coach brief
              </h2>
              <ul className="space-y-2">
                {insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                    <span
                      className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                        ins.kind === "good"
                          ? "bg-emerald-400"
                          : ins.kind === "watch"
                            ? "bg-amber-400"
                            : "bg-slate-500"
                      }`}
                    />
                    <span>{ins.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Strength progression per lift. */}
          <Card>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Strength progression
              </h2>
              {firstPt && lastPt && (
                <span className="text-xs text-slate-400">
                  {firstPt.e1rm} -&gt; {lastPt.e1rm} kg est. 1RM
                </span>
              )}
            </div>
            {exercises.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {exercises.map((e) => (
                  <button
                    key={e.name}
                    onClick={() => setPickedExercise(e.name)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      e.name === selected
                        ? "bg-emerald-500 text-slate-900"
                        : "bg-slate-700/50 text-slate-300 hover:text-slate-100"
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            )}
            <StrengthChart points={progression} />
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <Legend color="#34d399" label="Est. 1RM (Epley)" />
              <Legend color="#64748b" label="Top-set weight" />
            </div>
          </Card>

          {/* Weekly training load. */}
          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Weekly training
              </h2>
              <div className="flex gap-1 rounded-lg bg-slate-700/40 p-0.5 text-xs">
                {(["sessions", "volume"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setWeeklyMetric(m)}
                    className={`rounded-md px-2.5 py-1 font-medium capitalize transition ${
                      weeklyMetric === m ? "bg-emerald-500 text-slate-900" : "text-slate-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <WeeklyChart weeks={weeks} metric={weeklyMetric} />
          </Card>

          {/* Routine adherence. */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Routine adherence
            </h2>
            <div className="space-y-2">
              {adherence.map((d) => (
                <div key={d.dayLabel} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-200">{d.dayLabel}</span>
                  <span className="text-slate-400">
                    {d.count}x{d.lastDate ? ` - last ${shortLabel(d.lastDate)}` : ""}
                  </span>
                </div>
              ))}
            </div>
            {missing.length > 0 && (
              <div className="mt-4 border-t border-slate-700/50 pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-300/90">
                  In program, never logged
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((name) => (
                    <span
                      key={name}
                      className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Recent sessions - the actual work, so the coach sees specifics. */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Recent sessions
            </h2>
            <div className="space-y-3">
              {sessions.slice(0, 6).map((s) => {
                const loaded = s.sets.filter(isLoadedSet);
                return (
                  <div key={s.id} className="border-b border-slate-700/40 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-slate-100">{s.dayLabel ?? "Session"}</span>
                      <span className="text-xs text-slate-400">{shortLabel(s.date)}</span>
                    </div>
                    {loaded.length > 0 && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {loaded
                          .map((x) => `${x.exercise_name} ${x.weight_kg}kg x ${x.reps}`)
                          .join("  -  ")}
                      </p>
                    )}
                    {s.notes && <p className="mt-1 text-xs italic text-slate-500">"{s.notes}"</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
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
