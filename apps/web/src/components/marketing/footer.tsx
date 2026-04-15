export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Viajes Corporativos</p>
        <p>Diseño premium, enfoque operativo y cumplimiento.</p>
      </div>
    </footer>
  );
}
