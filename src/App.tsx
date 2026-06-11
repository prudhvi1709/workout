import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Login } from "./auth/Login";
import { Dashboard } from "./pages/Dashboard";
import { Workout } from "./pages/Workout";

export function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center text-slate-400">Loading...</div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/workout" element={<Workout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
