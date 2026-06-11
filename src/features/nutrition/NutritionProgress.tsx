import { Card } from "../../components/ui";

interface Props {
  calories: number | null;
  calorieTarget: number | null;
  protein: number | null;
  proteinTarget: number | null;
}

/**
 * Today's logged intake vs the user's daily targets. Calories are a ceiling
 * (stay at/under), protein is a floor (reach/exceed) - the bar colours reflect
 * that. Renders nothing until at least one target is set on the profile.
 */
export function NutritionProgress({ calories, calorieTarget, protein, proteinTarget }: Props) {
  if (calorieTarget == null && proteinTarget == null) return null;
  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Vs target</h2>
      {calorieTarget != null && (
        <Bar label="Calories" value={calories} target={calorieTarget} unit="kcal" mode="ceiling" />
      )}
      {proteinTarget != null && (
        <Bar label="Protein" value={protein} target={proteinTarget} unit="g" mode="floor" />
      )}
    </Card>
  );
}

function Bar({
  label,
  value,
  target,
  unit,
  mode,
}: {
  label: string;
  value: number | null;
  target: number;
  unit: string;
  mode: "ceiling" | "floor";
}) {
  const logged = value != null;
  const v = value ?? 0;
  const pct = Math.min(100, Math.round((v / target) * 100));
  const hit = v >= target;

  // Ceiling (calories): under = good (emerald), over = over budget (rose).
  // Floor (protein): at/over = good (emerald), under = not there yet (amber).
  const color = mode === "ceiling" ? (hit ? "bg-rose-400" : "bg-emerald-400") : hit ? "bg-emerald-400" : "bg-amber-400";

  let note: string;
  if (!logged) {
    note = "not logged";
  } else if (mode === "ceiling") {
    note = hit ? `${Math.round(v - target)} ${unit} over` : `${Math.round(target - v)} ${unit} left`;
  } else {
    note = hit ? "target hit" : `${Math.round(target - v)} ${unit} to go`;
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="text-slate-400">
          <span className="text-slate-100">{logged ? Math.round(v) : "--"}</span> / {target} {unit}
          <span className="ml-2 text-xs text-slate-500">{note}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/70 ring-1 ring-slate-700">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${logged ? pct : 0}%` }}
        />
      </div>
    </div>
  );
}
