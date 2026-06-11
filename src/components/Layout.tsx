import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/workout", label: "Workout", end: false },
];

export function Layout({
  title,
  children,
  hideNav = false,
}: {
  title: string;
  children: ReactNode;
  // Hide the bottom tab bar when a page shows its own fixed bottom action bar
  // (e.g. the workout logger's Save bar), so the two never overlap on mobile.
  hideNav?: boolean;
}) {
  const { user, signOut } = useAuth();
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold text-slate-50">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="hidden sm:inline">{user?.email}</span>
          <button onClick={() => void signOut()} className="rounded-lg px-2 py-1 hover:bg-slate-800">
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4 pb-28">{children}</main>

      {/* Bottom tab bar - primary nav on mobile. Hidden when the page owns the
          bottom bar (avoids overlapping a page's fixed action bar). */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-900/95 backdrop-blur sm:hidden ${
          hideNav ? "hidden" : ""
        }`}
      >
        <div className="mx-auto flex max-w-3xl">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-sm font-medium transition ${
                  isActive ? "text-emerald-400" : "text-slate-400"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Inline nav for wider screens. */}
      <nav className={`border-t border-slate-800 px-4 py-3 sm:gap-2 ${hideNav ? "hidden" : "hidden sm:flex"}`}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
