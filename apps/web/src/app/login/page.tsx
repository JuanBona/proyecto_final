import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "@/lib/session";

export default function LoginPage() {
  const session = getServerSession();

  if (session) {
    redirect(session.role === "approver" ? "/approvals" : "/trips/new");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />
      <Card
        data-ui="auth-shell"
        className="relative w-full max-w-md border-border/80 bg-card/90 shadow-[0_20px_50px_rgba(2,6,23,0.12)]"
      >
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accede a tu espacio para gestionar viajes y aprobaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
