// Advisory double-progression: we never auto-change the load, we surface what
// you did last time and a nudge. The human decides whether to add - this keeps
// it correct for a returning lifter and a cautious beginner alike.

export interface LastPerformance {
  weightKg: number | null;
  reps: number | null;
  sets: number | null;
  sessionDate: string; // ISO YYYY-MM-DD
}

/**
 * Top of a rep target: "5-8" -> 8, "10" -> 10. Anything non-numeric
 * ("8/leg", "30-45s", "rounds", "20 min") -> null, so no bogus suggestion.
 */
export function repRangeTop(targetReps: string | null): number | null {
  if (!targetReps) return null;
  const range = targetReps.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (range) return Number(range[2]);
  const single = targetReps.match(/^\s*(\d+)\s*$/);
  if (single) return Number(single[1]);
  return null;
}

/**
 * Short advisory hint from the last logged set. Returns null when there's no
 * usable history (e.g. first time doing the exercise, or a cardio/mobility row).
 */
export function progressionHint(
  top: number | null,
  last: LastPerformance | undefined,
): string | null {
  if (!last || last.weightKg == null) return null;
  const base = `Last: ${last.weightKg} kg`;
  if (last.reps == null) return base;
  const withReps = `${base} x ${last.reps}`;
  if (top != null && last.reps >= top) {
    return `${withReps} - hit the top of the range, consider a small bump.`;
  }
  if (top != null) {
    return `${withReps} - aim for ${top} reps, then add load.`;
  }
  return withReps;
}
