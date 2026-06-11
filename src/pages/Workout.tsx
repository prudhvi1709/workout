import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Card, Input } from "../components/ui";
import { useProgram, type ProgramDay } from "../features/workout/useProgram";
import { supabase } from "../lib/supabase";
import { todayISO } from "../lib/date";

interface SetRow {
  exercise_name: string;
  target: string; // e.g. "3x10"
  weight: string;
  sets: string;
  reps: string;
  rir: string;
  notes: string;
}

function rowsFromDay(day: ProgramDay): SetRow[] {
  return day.exercises.map((ex) => ({
    exercise_name: ex.exercise_name,
    target:
      ex.target_sets != null && ex.target_reps
        ? `${ex.target_sets}x${ex.target_reps}`
        : (ex.target_reps ?? "-"),
    weight: "",
    sets: ex.target_sets != null ? String(ex.target_sets) : "",
    reps: "",
    rir: "",
    notes: "",
  }));
}

export function Workout() {
  const { user } = useAuth();
  const { days, loading } = useProgram(user?.id);

  const [selected, setSelected] = useState<ProgramDay | null>(null);
  const [rows, setRows] = useState<SetRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pickDay(day: ProgramDay) {
    setSelected(day);
    setRows(rowsFromDay(day));
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
      .insert({ user_id: user.id, session_date: todayISO(), day_label: selected.dayLabel })
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
  }

  return (
    <Layout title="Workout" hideNav={selected !== null}>
      {saved && (
        <Card className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">{saved}</Card>
      )}

      {!selected && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Pick today's session
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
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">{selected.dayLabel}</h2>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Back
            </Button>
          </div>

          <div className="space-y-3">
            {rows.map((r, i) => (
              <Card key={`${r.exercise_name}-${i}`} className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-slate-100">{r.exercise_name}</span>
                  <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                    {r.target}
                  </span>
                </div>
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
            ))}
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
