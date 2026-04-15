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
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
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
