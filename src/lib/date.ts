// Date helpers. Logs are keyed by local calendar day (YYYY-MM-DD) so a
// morning weigh-in lands on "today" regardless of timezone/UTC drift.

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(fromISO: string, toISOArg: string): number {
  const a = parseISODate(fromISO).getTime();
  const b = parseISODate(toISOArg).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function shortLabel(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
