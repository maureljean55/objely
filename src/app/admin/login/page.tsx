"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));
    setIsSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin/signalements");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-headline-md text-on-surface">Objely Admin</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Connectez-vous à l&apos;espace administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl soft-shadow p-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block font-label-md text-label-md text-on-surface-variant mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-label-md text-label-md text-on-surface-variant mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-surface-container-low border border-outline-variant/50 text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {error && <p className="font-body-md text-body-md text-error bg-error-container/40 rounded-xl px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
