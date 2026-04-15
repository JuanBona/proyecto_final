# Task 6 Frontend Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar una landing premium + flujo web por rol (traveler/approver) con sesión SSR basada en cookies httpOnly.

**Architecture:** El frontend usa Next.js App Router server-first. La autenticación se resuelve con un BFF (`app/api/auth/*`) que conversa con la API Nest y administra cookies httpOnly (`accessToken`, `role`). Las páginas protegidas usan middleware + guards SSR por rol y componentes reutilizables de UI.

**Tech Stack:** Next.js App Router, React 18, Tailwind CSS v4, shadcn/ui, Framer Motion, Playwright.

---

### Task 1: Base de diseño premium + dependencias UI

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`
- Create: `apps/web/components.json`
- Create: `apps/web/src/components/ui/button.tsx`
- Create: `apps/web/src/components/ui/card.tsx`
- Create: `apps/web/src/components/ui/input.tsx`
- Create: `apps/web/src/lib/utils.ts`

- [ ] **Step 1: Agregar dependencias de UI y motion**

```json
{
  "dependencies": {
    "framer-motion": "^11.13.1",
    "lucide-react": "^0.475.0",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.51.0"
  }
}
```

- [ ] **Step 2: Instalar paquetes**

Run: `npm install -w apps/web`  
Expected: instalación sin errores.

- [ ] **Step 3: Definir fuente, metadata y base visual en layout**

```tsx
export const metadata: Metadata = {
  title: "Viajes Corporativos",
  description: "Gestión moderna de viajes corporativos",
};
```

```tsx
<html lang="es" className={`${sansFont.variable} ${monoFont.variable} h-full antialiased`}>
  <body className="min-h-full bg-background text-foreground">{children}</body>
</html>
```

- [ ] **Step 4: Implementar tokens de color + dark mode en globals**

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --muted: #64748b;
  --card: #ffffff;
  --primary: #2563eb;
}

.dark {
  --background: #020617;
  --foreground: #e2e8f0;
  --muted: #94a3b8;
  --card: #0f172a;
  --primary: #3b82f6;
}
```

- [ ] **Step 5: Crear primitives shadcn mínimas (button/card/input)**

```tsx
export const Button = cva("inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition");
```

- [ ] **Step 6: Verificar build web**

Run: `npm run build -w apps/web`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/package.json apps/web/src/app/layout.tsx apps/web/src/app/globals.css apps/web/components.json apps/web/src/components/ui apps/web/src/lib/utils.ts
git commit -m "feat(web): set premium design system base with shadcn and motion"
```

### Task 2: BFF auth + sesión SSR + middleware de roles

**Files:**
- Create: `apps/web/src/lib/session.ts`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/app/api/auth/login/route.ts`
- Create: `apps/web/src/app/api/auth/logout/route.ts`
- Create: `apps/web/src/app/api/auth/me/route.ts`
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Escribir test e2e mínimo de redirección sin sesión (fallando)**

```ts
test("redirects /trips/new to /login when no session", async ({ page }) => {
  await page.goto("/trips/new");
  await expect(page).toHaveURL(/\/login/);
});
```

- [ ] **Step 2: Ejecutar test para confirmar RED**

Run: `npm run test:e2e -w apps/web -- tests/e2e/critical-flow.spec.ts -g "redirects /trips/new"`  
Expected: FAIL (middleware inexistente).

- [ ] **Step 3: Crear utilidades de sesión server-side**

```ts
export function getSessionFromCookies(store: ReadonlyRequestCookies) {
  const accessToken = store.get("accessToken")?.value;
  const role = store.get("role")?.value;
  return accessToken && role ? { accessToken, role } : null;
}
```

- [ ] **Step 4: Implementar Route Handler login con cookie httpOnly**

```ts
cookies().set("accessToken", data.accessToken, { httpOnly: true, sameSite: "lax", path: "/" });
cookies().set("role", data.user.role, { httpOnly: true, sameSite: "lax", path: "/" });
```

- [ ] **Step 5: Implementar middleware con guards por ruta**

```ts
if (!token && protectedPath) return NextResponse.redirect(new URL("/login", req.url));
if (pathname.startsWith("/approvals") && role !== "approver") return NextResponse.redirect(new URL("/", req.url));
```

- [ ] **Step 6: Ejecutar test para GREEN**

Run: `npm run test:e2e -w apps/web -- tests/e2e/critical-flow.spec.ts -g "redirects /trips/new"`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/session.ts apps/web/src/lib/api.ts apps/web/src/app/api/auth apps/web/middleware.ts
git commit -m "feat(web): add bff auth with httpOnly session and role middleware"
```

### Task 3: Landing premium (`/`) + componentes de marketing

**Files:**
- Create: `apps/web/src/components/marketing/navbar.tsx`
- Create: `apps/web/src/components/marketing/hero.tsx`
- Create: `apps/web/src/components/marketing/features.tsx`
- Create: `apps/web/src/components/marketing/cta.tsx`
- Create: `apps/web/src/components/marketing/footer.tsx`
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Implementar navbar minimal**

```tsx
<header className="sticky top-0 z-40 backdrop-blur">
  <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">...</nav>
</header>
```

- [ ] **Step 2: Implementar hero con motion y CTA dual**

```tsx
<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
  <h1 className="text-5xl font-semibold tracking-tight">Viajes corporativos, sin fricción.</h1>
</motion.section>
```

- [ ] **Step 3: Implementar features cards + CTA final + footer**

```tsx
const items = [{ title: "Aprobaciones en minutos" }, { title: "Reservas trazables" }, { title: "Gastos auditables" }];
```

- [ ] **Step 4: Componer landing en `page.tsx`**

```tsx
export default function HomePage() {
  return (<><Navbar /><Hero /><Features /><CTA /><Footer /></>);
}
```

- [ ] **Step 5: Verificar build web**

Run: `npm run build -w apps/web`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/marketing apps/web/src/app/page.tsx
git commit -m "feat(web): build premium marketing landing for task 6"
```

### Task 4: Páginas de producto por rol

**Files:**
- Create: `apps/web/src/components/app/app-shell.tsx`
- Create: `apps/web/src/components/app/page-header.tsx`
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/trips/new/page.tsx`
- Create: `apps/web/src/app/approvals/page.tsx`
- Create: `apps/web/src/app/expenses/page.tsx`

- [ ] **Step 1: Crear shell reutilizable**

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>;
}
```

- [ ] **Step 2: Implementar login page conectada a BFF**

```tsx
await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
router.push(role === "approver" ? "/approvals" : "/trips/new");
```

- [ ] **Step 3: Implementar formulario de nuevo viaje (`/trips/new`)**

```tsx
await api.postTrip(session.accessToken, formData);
```

- [ ] **Step 4: Implementar cola de aprobaciones (`/approvals`)**

```tsx
const pending = await api.getPendingTrips(session.accessToken);
```

- [ ] **Step 5: Implementar carga de gastos (`/expenses`)**

```tsx
await api.submitExpense(session.accessToken, tripId, { amount, category, description });
```

- [ ] **Step 6: Verificar build web**

Run: `npm run build -w apps/web`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/app apps/web/src/app/login/page.tsx apps/web/src/app/trips/new/page.tsx apps/web/src/app/approvals/page.tsx apps/web/src/app/expenses/page.tsx
git commit -m "feat(web): add role-based app pages for login trips approvals expenses"
```

### Task 5: E2E del flujo crítico (Task 6)

**Files:**
- Create: `apps/web/playwright.config.ts`
- Modify: `apps/web/package.json`
- Create: `apps/web/tests/e2e/critical-flow.spec.ts`

- [ ] **Step 1: Configurar script e2e web**

```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Configurar Playwright**

```ts
export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev -w apps/web", url: "http://localhost:3000", reuseExistingServer: true }
});
```

- [ ] **Step 3: Escribir flujo crítico completo**

```ts
test("traveler requests trip and approver sees pending approval", async ({ page }) => {
  await page.goto("/login");
  // login traveler, create trip, logout
  // login approver
  await expect(page.getByText("Pendientes de aprobación")).toBeVisible();
});
```

- [ ] **Step 4: Ejecutar e2e Task 6**

Run: `npm run test:e2e -w apps/web -- tests/e2e/critical-flow.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Ejecutar verificación final web**

Run: `npm run build -w apps/web && npm run test:e2e -w apps/web -- tests/e2e/critical-flow.spec.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/playwright.config.ts apps/web/package.json apps/web/tests/e2e/critical-flow.spec.ts
git commit -m "test(web): add task 6 critical flow e2e coverage"
```

## Spec coverage check

- Landing premium minimalista (navbar, hero, features, CTA, footer): cubierto en Task 3.
- Flujo por rol (login, trips/new, approvals, expenses): cubierto en Task 4.
- BFF + cookies httpOnly + SSR guards: cubierto en Task 2.
- shadcn/ui + framer motion + diseño premium light/dark: cubierto en Tasks 1 y 3.
- E2E del flujo crítico Task 6: cubierto en Task 5.
