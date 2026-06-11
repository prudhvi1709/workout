import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";
import { Button, Card, Field, Input } from "../components/ui";
import { supabase } from "../lib/supabase";
import { todayISO } from "../lib/date";

// The form mirrors the editable columns of daily_logs. Everything is a string
// while editing (empty = "not logged"); booleans are real booleans.
interface FormState {
  morning_weight_kg: string;
  waist_cm: string;
  body_fat_pct: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  water_l: string;
  steps: string;
  cardio_min: string;
  bike_commute: boolean;
  swimming: boolean;
  sleep_hours: string;
  sleep_quality: string;
  energy_score: string;
  notes: string;
}

const EMPTY: FormState = {
  morning_weight_kg: "",
  waist_cm: "",
  body_fat_pct: "",
  calories: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
  water_l: "",
  steps: "",
  cardio_min: "",
  bike_commute: false,
  swimming: false,
  sleep_hours: "",
  sleep_quality: "",
  energy_score: "",
  notes: "",
};

const str = (n: number | null | undefined): string => (n != null ? String(n) : "");

/** Empty -> null; otherwise a finite number. Returns undefined when unparseable. */
function parseNum(value: string, { integer = false } = {}): number | null | undefined {
  const t = value.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return undefined;
  return integer ? Math.round(n) : n;
}

/** Clamp a 1-10 score; empty -> null, out-of-range -> undefined (validation error). */
function parseScore(value: string): number | null | undefined {
  const n = parseNum(value, { integer: true });
  if (n == null) return n; // null or undefined
  if (n < 1 || n > 10) return undefined;
  return n;
}

export function Daily() {
  const { user } = useAuth();
  const userId = user?.id;
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Prefill from any existing row for the chosen day (one row per user per day).
  useEffect(() => {
    if (!userId) return;
    let active = true;
    setStatus("loading");
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", date)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setStatus("idle");
        setForm(
          data
            ? {
                morning_weight_kg: str(data.morning_weight_kg),
                waist_cm: str(data.waist_cm),
                body_fat_pct: str(data.body_fat_pct),
                calories: str(data.calories),
                protein_g: str(data.protein_g),
                carbs_g: str(data.carbs_g),
                fat_g: str(data.fat_g),
                water_l: str(data.water_l),
                steps: str(data.steps),
                cardio_min: str(data.cardio_min),
                bike_commute: data.bike_commute,
                swimming: data.swimming,
                sleep_hours: str(data.sleep_hours),
                sleep_quality: str(data.sleep_quality),
                energy_score: str(data.energy_score),
                notes: data.notes ?? "",
              }
            : EMPTY,
        );
      });
    return () => {
      active = false;
    };
  }, [userId, date]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;

    // Convert every numeric field; collect the first invalid one.
    const decFields = ["morning_weight_kg", "waist_cm", "body_fat_pct", "water_l", "sleep_hours"] as const;
    const intFields = ["calories", "protein_g", "carbs_g", "fat_g", "steps", "cardio_min"] as const;

    const payload: Record<string, number | string | boolean | null> = {
      user_id: userId,
      log_date: date,
      bike_commute: form.bike_commute,
      swimming: form.swimming,
      notes: form.notes.trim() === "" ? null : form.notes.trim(),
    };

    for (const f of decFields) {
      const n = parseNum(form[f]);
      if (n === undefined) return fail(`"${f}" is not a valid number.`);
      payload[f] = n;
    }
    for (const f of intFields) {
      const n = parseNum(form[f], { integer: true });
      if (n === undefined) return fail(`"${f}" is not a valid number.`);
      payload[f] = n;
    }
    const sq = parseScore(form.sleep_quality);
    if (sq === undefined) return fail("Sleep quality must be 1-10.");
    payload.sleep_quality = sq;
    const en = parseScore(form.energy_score);
    if (en === undefined) return fail("Energy must be 1-10.");
    payload.energy_score = en;

    setStatus("saving");
    setError(null);
    const { error: upsertError } = await supabase
      .from("daily_logs")
      .upsert(payload, { onConflict: "user_id,log_date" });
    if (upsertError) return fail(upsertError.message);
    setStatus("saved");
  }

  function fail(message: string) {
    setError(message);
    setStatus("error");
  }

  return (
    <Layout title="Daily log">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Date</span>
          <Input
            type="date"
            className="max-w-44"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
          {status === "loading" && <span className="text-xs text-slate-500">Loading...</span>}
        </Card>

        <Section title="Body">
          <NumField label="Weight (kg)" value={form.morning_weight_kg} step="0.1" placeholder="101.4" onChange={(v) => set("morning_weight_kg", v)} />
          <NumField label="Waist (cm)" value={form.waist_cm} step="0.1" placeholder="92" onChange={(v) => set("waist_cm", v)} />
          <NumField label="Body fat %" value={form.body_fat_pct} step="0.1" placeholder="28" onChange={(v) => set("body_fat_pct", v)} />
        </Section>

        <Section title="Nutrition">
          <NumField label="Calories" value={form.calories} integer placeholder="2000" onChange={(v) => set("calories", v)} />
          <NumField label="Protein (g)" value={form.protein_g} integer placeholder="170" onChange={(v) => set("protein_g", v)} />
          <NumField label="Carbs (g)" value={form.carbs_g} integer placeholder="180" onChange={(v) => set("carbs_g", v)} />
          <NumField label="Fat (g)" value={form.fat_g} integer placeholder="60" onChange={(v) => set("fat_g", v)} />
          <NumField label="Water (L)" value={form.water_l} step="0.1" placeholder="3.0" onChange={(v) => set("water_l", v)} />
        </Section>

        <Section title="Activity">
          <NumField label="Steps" value={form.steps} integer placeholder="9000" onChange={(v) => set("steps", v)} />
          <NumField label="Cardio (min)" value={form.cardio_min} integer placeholder="30" onChange={(v) => set("cardio_min", v)} />
          <Toggle label="Bike commute" checked={form.bike_commute} onChange={(v) => set("bike_commute", v)} />
          <Toggle label="Swimming" checked={form.swimming} onChange={(v) => set("swimming", v)} />
        </Section>

        <Section title="Recovery">
          <NumField label="Sleep (hrs)" value={form.sleep_hours} step="0.5" placeholder="7.5" onChange={(v) => set("sleep_hours", v)} />
          <NumField label="Sleep quality (1-10)" value={form.sleep_quality} integer min={1} max={10} placeholder="8" onChange={(v) => set("sleep_quality", v)} />
          <NumField label="Energy (1-10)" value={form.energy_score} integer min={1} max={10} placeholder="7" onChange={(v) => set("energy_score", v)} />
        </Section>

        <Card className="space-y-2">
          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="How did the day go?"
              className="w-full rounded-xl bg-slate-900/70 px-3 py-2.5 text-slate-100 ring-1 ring-slate-700 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
            />
          </Field>
        </Card>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving..." : "Save daily log"}
          </Button>
          {status === "saved" && <span className="text-sm text-emerald-400">Saved ✓</span>}
        </div>
      </form>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </Card>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
  placeholder,
  integer = false,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  placeholder?: string;
  integer?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        inputMode={integer ? "numeric" : "decimal"}
        step={step ?? (integer ? "1" : "any")}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl bg-slate-900/70 px-3 py-2.5 ring-1 ring-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-emerald-400"
      />
      <span className="text-sm text-slate-200">{label}</span>
    </label>
  );
}
