import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.06),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.05),transparent_44%)] bg-background">
      <header
        data-ui="app-shell-header"
        className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md"
      >
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
