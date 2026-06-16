import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Card, Field, Input } from "../components/ui";
import { useProgram, type ProgramDay } from "../features/workout/useProgram";
import { useLastPerformance } from "../features/workout/useLastPerformance";
import { exerciseWhy } from "../features/workout/exerciseInfo";
import { progressionHint, repRangeTop, type LastPerformance } from "../features/workout/progression";
import { supabase } from "../lib/supabase";
import { todayISO } from "../lib/date";

interface SetRow {
  exercise_name: string;
  target: string; // e.g. "3x10"
  targetRepsTop: number | null; // top of the rep range, for the progression hint
  weight: string;
  sets: string;
  reps: string;
  rir: string;
  notes: string;
}

function rowsFromDay(day: ProgramDay, last: Map<string, LastPerformance>): SetRow[] {
  return day.exercises.map((ex) => {
    const prev = last.get(ex.exercise_name);
    return {
      exercise_name: ex.exercise_name,
      target:
        ex.target_sets != null && ex.target_reps
          ? `${ex.target_sets}x${ex.target_reps}`
          : (ex.target_reps ?? "-"),
      targetRepsTop: repRangeTop(ex.target_reps),
      // Prefill last session's weight as a convenience; the human decides whether
      // to bump it (advisory progression, not auto-applied).
      weight: prev?.weightKg != null ? String(prev.weightKg) : "",
      sets: ex.target_sets != null ? String(ex.target_sets) : "",
      reps: "",
      rir: "",
      notes: "",
    };
  });
}

export function Workout() {
  const { user } = useAuth();
  const { days, loading } = useProgram(user?.id);
  const lastByExercise = useLastPerformance(user?.id);

  const [selected, setSelected] = useState<ProgramDay | null>(null);
  const [rows, setRows] = useState<SetRow[]>([]);
  // The date the workout was actually done (default today, editable) so past
  // sessions can be backfilled.
  const [sessionDate, setSessionDate] = useState(todayISO());
  // One free-text box for the whole session (saved to workout_sessions.notes),
  // separate from the per-exercise notes on each card.
  const [sessionNotes, setSessionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pickDay(day: ProgramDay) {
    setSelected(day);
    setRows(rowsFromDay(day, lastByExercise));
    setSessionNotes("");
    setSaved(null);
    setError(null);
  }

  function update(i: number, key: keyof SetRow, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }

  const filledCount = useMemo(
    () => rows.filter((r) => r.weight !== "" || r.reps !== "" || r.notes !== "").length,
    [rows],
  );

  async function save() {
    if (!user || !selected) return;
    const toLog = rows.filter((r) => r.weight !== "" || r.reps !== "" || r.notes !== "");
    if (toLog.length === 0) {
      setError("Enter at least one exercise before saving.");
      return;
    }
    setSaving(true);
    setError(null);

    const { data: session, error: sErr } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        session_date: sessionDate,
        day_label: selected.dayLabel,
        notes: sessionNotes.trim() || null,
      })
      .select("id")
      .single();

    if (sErr || !session) {
      setError(sErr?.message ?? "Could not create session.");
      setSaving(false);
      return;
    }

    const setsPayload = toLog.map((r, position) => ({
      session_id: session.id,
      user_id: user.id,
      exercise_name: r.exercise_name,
      weight_kg: r.weight === "" ? null : Number(r.weight),
      sets: r.sets === "" ? null : Number(r.sets),
      reps: r.reps === "" ? null : Number(r.reps),
      rir: r.rir === "" ? null : Number(r.rir),
      position,
      notes: r.notes || null,
    }));

    const { error: setErr } = await supabase.from("workout_sets").insert(setsPayload);
    setSaving(false);
    if (setErr) {
      setError(setErr.message);
      return;
    }
    setSaved(`Logged ${toLog.length} exercise(s).`);
    setSelected(null);
    setRows([]);
    setSessionNotes("");
  }

  return (
    <Layout title="Workout" hideNav={selected !== null}>
      {saved && (
        <Card className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">{saved}</Card>
      )}

      {!selected && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Pick a session
          </h2>
          {loading && <p className="text-sm text-slate-500">Loading program...</p>}
          {!loading && days.length === 0 && (
            <p className="text-sm text-slate-500">
              No program found. Seed the program in Supabase (see README).
            </p>
          )}
          <div className="grid gap-2">
            {days.map((d) => (
              <button
                key={d.dayLabel}
                onClick={() => pickDay(d)}
                className="flex items-center justify-between rounded-xl bg-slate-700/50 px-4 py-3.5 text-left text-slate-100 transition active:bg-slate-700"
              >
                <span className="font-medium">{d.dayLabel}</span>
                <span className="text-xs text-slate-400">{d.exercises.length} exercises</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-100">{selected.dayLabel}</h2>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Back
            </Button>
          </div>

          <Card className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Workout date
            </span>
            <input
              type="date"
              value={sessionDate}
              max={todayISO()}
              onChange={(e) => setSessionDate(e.target.value)}
              className="rounded-lg bg-slate-900/70 px-3 py-2 text-slate-100 ring-1 ring-slate-700 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </Card>

          <Card>
            <Field label="Session notes">
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Anything about today's session - energy, crowd, pain, wins..."
                rows={3}
                className="w-full resize-y rounded-xl bg-slate-900/70 px-3 py-2.5 text-slate-100 ring-1 ring-slate-700 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
              />
            </Field>
          </Card>

          <div className="space-y-3">
            {rows.map((r, i) => {
              const why = exerciseWhy(r.exercise_name);
              const hint = progressionHint(r.targetRepsTop, lastByExercise.get(r.exercise_name));
              return (
              <Card key={`${r.exercise_name}-${i}`} className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-slate-100">
                    {r.exercise_name}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`how to do ${r.exercise_name} exercise`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Search "${r.exercise_name}"`}
                      aria-label={`Search how to do ${r.exercise_name}`}
                      className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-sky-300 transition active:bg-slate-700"
                    >
                      🔍 how
                    </a>
                  </span>
                  <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                    {r.target}
                  </span>
                </div>
                {why && <p className="text-xs leading-snug text-slate-400">{why}</p>}
                {hint && <p className="text-xs text-emerald-300/90">{hint}</p>}
                <div className="grid grid-cols-4 gap-2">
                  <LabeledInput label="kg" value={r.weight} onChange={(v) => update(i, "weight", v)} />
                  <LabeledInput label="sets" value={r.sets} onChange={(v) => update(i, "sets", v)} />
                  <LabeledInput label="reps" value={r.reps} onChange={(v) => update(i, "reps", v)} />
                  <LabeledInput label="RIR" value={r.rir} onChange={(v) => update(i, "rir", v)} />
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={r.notes}
                  onChange={(e) => update(i, "notes", e.target.value)}
                />
              </Card>
              );
            })}
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          {/* Sticky save bar for thumb reach on mobile. */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-800 bg-slate-900/95 p-3 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-1">
              <span className="text-sm text-slate-400">{filledCount} filled</span>
              <Button className="flex-1" onClick={() => void save()} disabled={saving}>
                {saving ? "Saving..." : "Save session"}
              </Button>
            </div>
          </div>
          <div className="h-16" />
        </>
      )}
    </Layout>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-center text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-slate-900/70 px-2 py-2.5 text-center text-slate-100 ring-1 ring-slate-700 outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </label>
  );
}
