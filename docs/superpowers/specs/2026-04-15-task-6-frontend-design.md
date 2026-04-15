# Diseño — Task 6 Frontend por rol + Landing premium

## 1. Objetivo

Implementar el frontend del MVP con dos superficies:

1. **Landing pública premium** (estilo Apple/Stripe/Linear): navbar, hero, features, CTA y footer.
2. **Flujo de producto por rol**: login, creación de viaje (traveler), cola de aprobaciones (approver) y carga de gastos (traveler), con sesión SSR basada en cookies httpOnly.

## 2. Alcance

### Incluido

- Next.js App Router con render server-first.
- BFF en Route Handlers para autenticación y sesión (`login/logout/me`).
- Protección por rol vía middleware + redirecciones SSR.
- UI premium, minimalista, responsive, light+dark mode.
- Componentes reutilizables con Tailwind + shadcn/ui.
- Microinteracciones con Framer Motion.
- E2E web del flujo crítico Task 6.

### Excluido

- Integración de IA conversacional en frontend.
- Panel administrativo completo.
- Flujos avanzados de refresh/retry offline.

## 3. Arquitectura frontend

## 3.1 Estrategia de sesión (SSR + cookies httpOnly)

- `POST /api/auth/login` (BFF) llama al backend y setea cookies httpOnly seguras:
  - `accessToken`
  - `role`
- `POST /api/auth/logout` limpia cookies.
- `GET /api/auth/me` resuelve usuario actual desde cookie.
- Las páginas usan lectura server-side de sesión para render inicial y guards.

## 3.2 Protección por rutas y rol

- `middleware.ts`:
  - permite `/` y `/login`.
  - protege `/trips/new`, `/approvals`, `/expenses`.
  - redirige por rol inválido/no autenticado.
- Guards SSR en páginas sensibles para evitar flicker de estado.

## 3.3 Integración con backend

- `src/lib/api.ts` centraliza llamadas al backend.
- Desde server components/route handlers se propaga `Authorization: Bearer <accessToken>`.
- Manejo de error estándar (`code/message/statusCode`) con mapeo a UI.

## 4. Diseño visual y UX

## 4.1 Sistema visual

- Tipografía: **Inter**.
- Grid y spacing: base 8px.
- Paleta corta:
  - neutrales (fondos/texto),
  - acento azul para acciones primarias,
  - estados semánticos discretos.
- Bordes suaves, sombras bajas, alto uso de espacio negativo.

## 4.2 Landing pública (`/`)

- **Navbar**: marca + links + CTA de login.
- **Hero**: claim principal, subtítulo y CTA claro.
- **Features**: cards elegantes con beneficios del flujo.
- **CTA final**: invitación a iniciar flujo.
- **Footer**: minimalista, información esencial.

## 4.3 App por rol

- **`/login`**: pantalla limpia, foco en acción.
- **`/trips/new` (traveler)**: formulario de solicitud.
- **`/approvals` (approver)**: lista de pendientes y acciones.
- **`/expenses` (traveler)**: carga de gasto con feedback de estado.

## 4.4 Accesibilidad y responsive

- Mobile-first con breakpoints consistentes.
- Labels explícitos, foco visible, navegación por teclado.
- Contraste base AA.
- ARIA en navegación y acciones críticas.

## 4.5 Motion

- Framer Motion para:
  - entrada de secciones (fade/slide suave),
  - hover/tap en botones/cards,
  - transiciones cortas y no intrusivas.

## 5. Estructura de archivos

- `apps/web/src/lib/api.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/trips/new/page.tsx`
- `apps/web/src/app/approvals/page.tsx`
- `apps/web/src/app/expenses/page.tsx`
- `apps/web/src/components/*` (shell y piezas reutilizables)
- `apps/web/tests/e2e/critical-flow.spec.ts`

## 6. Flujo crítico (Task 6)

1. Traveler inicia sesión.
2. Traveler crea solicitud de viaje.
3. Approver inicia sesión.
4. Approver visualiza pendientes de aprobación.

Criterio de aceptación: E2E verde con visibilidad de pendientes.

## 7. Manejo de errores y estados

- Estados UI: loading, empty, error, success.
- Errores mostrados inline/toast según contexto.
- Mensajes accionables, sin silencios.

## 8. Riesgos y mitigaciones

- **Riesgo**: divergencia entre sesión SSR y estado UI.
  - **Mitigación**: fuente única en cookies + lectura server-first.
- **Riesgo**: sobrecarga visual.
  - **Mitigación**: sistema visual restringido + componentes mínimos.
- **Riesgo**: regressions en flujo de roles.
  - **Mitigación**: E2E del recorrido crítico.
