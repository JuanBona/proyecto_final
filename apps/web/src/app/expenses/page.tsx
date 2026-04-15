import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, getTrips, submitExpense } from "@/lib/api";
import { requireSession } from "@/lib/session";

interface ExpensesPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const session = requireSession(["traveler"]);
  const trips = await getTrips(session.accessToken);
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const message = typeof searchParams?.message === "string" ? searchParams.message : undefined;

  async function submitExpenseAction(formData: FormData) {
    "use server";
    const current = requireSession(["traveler"]);

    const tripId = String(formData.get("tripId") ?? "");
    const amount = Number(formData.get("amount"));
    const category = String(formData.get("category") ?? "");
    const description = String(formData.get("description") ?? "");
    let statusMessage = "";

    try {
      const result = await submitExpense(current.accessToken, tripId, {
        amount,
        category,
        description: description || undefined,
      });
      statusMessage = `Gasto enviado con estado ${result.status}`;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "No se pudo enviar el gasto";
      redirect(`/expenses?status=error&message=${encodeURIComponent(errorMessage)}`);
    }

    redirect(`/expenses?status=success&message=${encodeURIComponent(statusMessage)}`);
  }

  return (
    <AppShell title="Gastos" subtitle="Portal traveler">
      <PageHeader title="Cargar gasto" description="Adjunta gastos asociados a un viaje existente." />
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
      <form
        action={submitExpenseAction}
        className="grid gap-5 rounded-2xl border border-border/70 bg-card/85 p-6 shadow-[0_12px_36px_rgba(2,6,23,0.08)]"
      >
        <div className="grid gap-2">
          <label htmlFor="tripId" className="text-sm font-medium">
            Viaje
          </label>
          <select
            id="tripId"
            name="tripId"
            required
            className="h-10 rounded-xl border border-border/80 bg-card/65 px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
          >
            <option value="">Selecciona un viaje</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination} ({trip.status})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Monto
            </label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">
              Categoría
            </label>
            <Input id="category" name="category" required placeholder="hotel, meal, taxi..." />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Descripción (opcional)
          </label>
          <Input id="description" name="description" />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Enviar gasto</Button>
        </div>
      </form>
    </AppShell>
  );
}
