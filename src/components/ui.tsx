import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-slate-800/60 ring-1 ring-slate-700/50 p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles: Record<string, string> = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold",
    ghost: "bg-slate-700/60 hover:bg-slate-700 text-slate-100",
    danger: "bg-rose-500/90 hover:bg-rose-500 text-white",
  };
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl bg-slate-900/70 px-3 py-2.5 text-slate-100 ring-1 ring-slate-700 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400 ${className}`}
      {...props}
    />
  );
}

export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-2xl font-bold text-slate-50">{value}</span>
      {sub != null && <span className="text-xs text-slate-400">{sub}</span>}
    </Card>
  );
}
