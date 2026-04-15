export function Footer() {
  return (
    <footer className="relative border-t border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Viajes Corporativos</p>
        <p>Diseño premium, enfoque operativo y cumplimiento.</p>
      </div>
    </footer>
  );
}
