import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div>
            <p className="text-sm font-semibold tracking-tight">Viajes Corporativos</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline" size="sm" type="submit">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
