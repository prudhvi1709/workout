import { useState, type FormEvent } from "react";
import { Button, Card, Field, Input } from "../components/ui";
import { useAuth } from "./AuthContext";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-50">Recomp Tracker</h1>
        <p className="mb-5 text-sm text-slate-400">Sign in to log your day.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
