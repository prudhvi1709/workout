import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { todayISO } from "../../lib/date";
import { Button, Card, Field, Input } from "../../components/ui";

interface Props {
  userId: string;
  onSaved: () => void;
}

/**
 * Morning weigh-in. Upserts into daily_logs keyed on (user_id, log_date) so
 * re-logging the same day overwrites rather than duplicating.
 */
export function LogWeight({ userId, onSaved }: Props) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Prefill if a weight already exists for the chosen date.
  useEffect(() => {
    let active = true;
    setStatus("idle");
    supabase
      .from("daily_logs")
      .select("morning_weight_kg")
      .eq("user_id", userId)
      .eq("log_date", date)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setWeight(data?.morning_weight_kg != null ? String(data.morning_weight_kg) : "");
      });
    return () => {
      active = false;
    };
  }, [userId, date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const kg = Number(weight);
    if (!Number.isFinite(kg) || kg <= 0) {
      setError("Enter a valid weight in kg.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setError(null);

    const { error: upsertError } = await supabase
      .from("daily_logs")
      .upsert(
        { user_id: userId, log_date: date, morning_weight_kg: kg },
        { onConflict: "user_id,log_date" },
      );

    if (upsertError) {
      setError(upsertError.message);
      setStatus("error");
      return;
    }
    setStatus("saved");
    onSaved();
  }

  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-300">
        Body weight
      </h2>
      <p className="mb-3 text-xs leading-snug text-slate-400">
        Weigh at the same point every time (post-workout, a few minutes after
        cooling down). Consistent timing is what keeps the 7-day average
        comparable - the trend matters more than any single reading.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="w-36">
          <Field label="Date">
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <div className="w-32">
          <Field label="Weight (kg)">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="e.g. 101.4"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save"}
        </Button>
        {status === "saved" && <span className="text-sm text-emerald-400">Saved ✓</span>}
        {status === "error" && error && <span className="text-sm text-rose-400">{error}</span>}
      </form>
    </Card>
  );
}
