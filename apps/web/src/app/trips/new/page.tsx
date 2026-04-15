import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, createTrip, submitTrip } from "@/lib/api";
import { requireSession } from "@/lib/session";

interface TripsNewPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function TripsNewPage({ searchParams }: TripsNewPageProps) {
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const message = typeof searchParams?.message === "string" ? searchParams.message : undefined;

  async function createTripAction(formData: FormData) {
    "use server";
    const session = requireSession(["traveler"]);
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");

    try {
      const trip = await createTrip(session.accessToken, {
        destination: String(formData.get("destination") ?? ""),
        startDate: `${startDate}T00:00:00.000Z`,
        endDate: `${endDate}T00:00:00.000Z`,
        reason: String(formData.get("reason") ?? ""),
        budget: Number(formData.get("budget")),
        costCenter: String(formData.get("costCenter") ?? ""),
      });
      await submitTrip(session.accessToken, trip.id);
    } catch (error) {
      if (error instanceof ApiError) {
        redirect(`/trips/new?status=error&message=${encodeURIComponent(error.message)}`);
      }
      if (error instanceof Error) {
        redirect(`/trips/new?status=error&message=${encodeURIComponent(error.message)}`);
      }
      throw error;
    }

    redirect("/trips/new?status=success&message=Solicitud%20enviada%20para%20aprobaci%C3%B3n");
  }

  return (
    <AppShell title="Nuevo viaje" subtitle="Portal traveler">
      <PageHeader title="Solicitar viaje" description="Completa los datos y envía tu solicitud para aprobación." />
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
      <form action={createTripAction} className="grid gap-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-2">
          <label htmlFor="destination" className="text-sm font-medium">
            Destino
          </label>
          <Input id="destination" name="destination" required />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              Fecha de inicio
            </label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              Fecha de fin
            </label>
            <Input id="endDate" name="endDate" type="date" required />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="reason" className="text-sm font-medium">
            Motivo
          </label>
          <Input id="reason" name="reason" required />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <label htmlFor="budget" className="text-sm font-medium">
              Presupuesto
            </label>
            <Input id="budget" name="budget" type="number" min="1" step="1" required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="costCenter" className="text-sm font-medium">
              Centro de costo
            </label>
            <Input id="costCenter" name="costCenter" required />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Enviar solicitud</Button>
        </div>
      </form>
    </AppShell>
  );
}
