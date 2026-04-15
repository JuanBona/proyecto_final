import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, approveTrip, getPendingTrips, rejectTrip } from "@/lib/api";
import { requireSession } from "@/lib/session";

interface ApprovalsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ApprovalsPage({ searchParams }: ApprovalsPageProps) {
  const session = requireSession(["approver"]);
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const message = typeof searchParams?.message === "string" ? searchParams.message : undefined;
  const pendingTrips = await getPendingTrips(session.accessToken);

  async function decideTripAction(formData: FormData) {
    "use server";
    const current = requireSession(["approver"]);
    const tripId = String(formData.get("tripId") ?? "");
    const decision = String(formData.get("decision") ?? "");
    const comment = String(formData.get("comment") ?? "");

    try {
      if (decision === "approve") {
        await approveTrip(current.accessToken, tripId, comment);
      } else if (decision === "reject") {
        await rejectTrip(current.accessToken, tripId, comment);
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "No se pudo registrar la decisión";
      redirect(`/approvals?status=error&message=${encodeURIComponent(errorMessage)}`);
    }

    redirect("/approvals?status=success&message=Decisi%C3%B3n%20registrada");
  }

  return (
    <AppShell title="Aprobaciones" subtitle="Portal approver">
      <PageHeader
        title="Pendientes de aprobación"
        description="Revisa solicitudes de viaje y decide si avanzar o rechazar."
      />
      {status && message ? (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            status === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
      {pendingTrips.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No hay solicitudes pendientes en este momento.
        </p>
      ) : (
        <div className="grid gap-4">
          {pendingTrips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <CardTitle>{trip.destination}</CardTitle>
                <CardDescription>
                  {new Date(trip.startDate).toLocaleDateString("es-AR")} -{" "}
                  {new Date(trip.endDate).toLocaleDateString("es-AR")} • Presupuesto ${trip.budget}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{trip.reason}</p>
                <form action={decideTripAction} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <input type="hidden" name="tripId" value={trip.id} />
                  <input
                    type="text"
                    name="comment"
                    placeholder="Comentario opcional"
                    className="h-10 rounded-xl border border-border bg-transparent px-3 text-sm"
                  />
                  <Button type="submit" name="decision" value="approve">
                    Aprobar
                  </Button>
                  <Button type="submit" variant="outline" name="decision" value="reject">
                    Rechazar
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
