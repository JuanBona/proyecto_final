"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setError(data.message ?? "No se pudo iniciar sesión");
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as { user: { role: "traveler" | "approver" } };
    router.push(data.user.role === "approver" ? "/approvals" : "/trips/new");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Formulario de inicio de sesión">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
