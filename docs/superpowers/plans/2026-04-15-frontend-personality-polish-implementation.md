# Frontend Personality Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editorial-elegant visual personality and subtle premium motion to landing + authenticated screens while preserving existing flows and accessibility.

**Architecture:** Build a small reusable styling foundation first (surface variants + shared effects), then apply it across marketing and internal app shells. Drive implementation with e2e visual-behavior checks first, then minimal component/page updates that satisfy each check.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Framer Motion, Playwright

---

## File Structure Map

- Create: `apps/web/src/components/ui/surface.tsx` (shared reusable surface variants for cards/containers)
- Create: `apps/web/tests/e2e/personality-polish.spec.ts` (UI personality regression checks)
- Modify: `apps/web/src/components/ui/card.tsx` (adopt surface variants)
- Modify: `apps/web/src/components/ui/button.tsx` (refined interactive states)
- Modify: `apps/web/src/components/ui/input.tsx` (internal form surface consistency)
- Modify: `apps/web/src/components/marketing/navbar.tsx` (editorial nav accents + subtle interactions)
- Modify: `apps/web/src/components/marketing/hero.tsx` (depth, accent layers, premium typography rhythm)
- Modify: `apps/web/src/components/marketing/features.tsx` (more distinctive cards + restrained motion)
- Modify: `apps/web/src/components/marketing/cta.tsx` (gradient depth + premium action emphasis)
- Modify: `apps/web/src/components/marketing/footer.tsx` (visual finish consistent with landing)
- Modify: `apps/web/src/components/app/app-shell.tsx` (internal shell personality)
- Modify: `apps/web/src/components/app/page-header.tsx` (internal typography/accents)
- Modify: `apps/web/src/app/login/page.tsx` (editorial framed auth panel)
- Modify: `apps/web/src/app/trips/new/page.tsx` (form container polish)
- Modify: `apps/web/src/app/approvals/page.tsx` (queue cards + state containers polish)
- Modify: `apps/web/src/app/expenses/page.tsx` (form/list visual alignment with shell)
- Test existing: `apps/web/tests/e2e/critical-flow.spec.ts` (ensure functional flow still passes)

---

### Task 1: Add failing visual regression checks (landing + internal shell)

**Files:**
- Create: `apps/web/tests/e2e/personality-polish.spec.ts`
- Test: `apps/web/tests/e2e/personality-polish.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "@playwright/test";

test("landing exposes editorial personality markers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-ui='hero-accent']")).toBeVisible();
  await expect(page.locator("[data-ui='feature-surface']").first()).toBeVisible();
  await expect(page.locator("[data-ui='cta-depth-layer']")).toBeVisible();
});

test("internal screens use polished app shell surfaces", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("[data-ui='auth-shell']")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts`  
Expected: FAIL on missing selectors (`data-ui='hero-accent'`, `data-ui='feature-surface'`, etc.)

- [ ] **Step 3: Commit failing tests**

```bash
git add apps/web/tests/e2e/personality-polish.spec.ts
git commit -m "test(web): add failing personality polish e2e checks"
```

---

### Task 2: Build reusable surface foundation and primitive polish

**Files:**
- Create: `apps/web/src/components/ui/surface.tsx`
- Modify: `apps/web/src/components/ui/card.tsx`
- Modify: `apps/web/src/components/ui/button.tsx`
- Modify: `apps/web/src/components/ui/input.tsx`
- Test: `apps/web/tests/e2e/personality-polish.spec.ts`

- [ ] **Step 1: Write/adjust failing test for reusable surface marker**

```ts
test("feature cards expose shared surface marker", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-ui='feature-surface']").first()).toHaveClass(/shadow|border/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts -g "shared surface marker"`  
Expected: FAIL because `data-ui='feature-surface'` is not emitted yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
// apps/web/src/components/ui/surface.tsx
import { cva } from "class-variance-authority";

export const surfaceVariants = cva("rounded-2xl border transition-all", {
  variants: {
    tone: {
      soft: "border-border/70 bg-card/80 shadow-[0_8px_30px_rgba(2,6,23,0.05)]",
      elevated: "border-border bg-card shadow-[0_18px_50px_rgba(2,6,23,0.10)]",
      inset: "border-border/60 bg-background/70",
    },
  },
  defaultVariants: { tone: "soft" },
});
```

```tsx
// apps/web/src/components/ui/card.tsx (core change)
<div
  data-ui={props["data-ui"] ?? "card-surface"}
  className={cn(surfaceVariants({ tone: "soft" }), "text-card-foreground", className)}
  ...
/>
```

```tsx
// apps/web/src/components/ui/button.tsx (core change)
"... rounded-xl ... duration-200 ease-out focus-visible:ring-offset-background/80 ..."
// default variant example:
"bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 hover:brightness-105"
```

```tsx
// apps/web/src/components/ui/input.tsx (core change)
"... rounded-xl border-border/80 bg-card/60 backdrop-blur-sm ... focus-visible:ring-primary/80 ..."
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts -g "shared surface marker"`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ui/surface.tsx apps/web/src/components/ui/card.tsx apps/web/src/components/ui/button.tsx apps/web/src/components/ui/input.tsx
git commit -m "feat(web): add reusable premium surfaces and primitive polish"
```

---

### Task 3: Apply editorial personality to landing sections

**Files:**
- Modify: `apps/web/src/components/marketing/navbar.tsx`
- Modify: `apps/web/src/components/marketing/hero.tsx`
- Modify: `apps/web/src/components/marketing/features.tsx`
- Modify: `apps/web/src/components/marketing/cta.tsx`
- Modify: `apps/web/src/components/marketing/footer.tsx`
- Test: `apps/web/tests/e2e/personality-polish.spec.ts`

- [ ] **Step 1: Expand failing tests with exact landing markers**

```ts
await expect(page.locator("[data-ui='hero-accent']")).toBeVisible();
await expect(page.locator("[data-ui='feature-surface']").count()).resolves.toBeGreaterThan(2);
await expect(page.locator("[data-ui='cta-depth-layer']")).toBeVisible();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts -g "landing exposes editorial personality markers"`  
Expected: FAIL on missing elements.

- [ ] **Step 3: Write minimal implementation**

```tsx
// hero.tsx (add visual depth marker)
<div data-ui="hero-accent" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-primary/10 to-transparent" />
```

```tsx
// features.tsx (mark each feature surface)
<Card data-ui="feature-surface" className="h-full backdrop-blur-[1px]">
```

```tsx
// cta.tsx (depth layer marker)
<div data-ui="cta-depth-layer" className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/8 via-transparent to-foreground/[0.03]" />
```

```tsx
// navbar/footer (editorial accents)
className additions: "after:h-px after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts -g "landing exposes editorial personality markers"`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/marketing/navbar.tsx apps/web/src/components/marketing/hero.tsx apps/web/src/components/marketing/features.tsx apps/web/src/components/marketing/cta.tsx apps/web/src/components/marketing/footer.tsx apps/web/tests/e2e/personality-polish.spec.ts
git commit -m "feat(web): apply editorial personality to landing sections"
```

---

### Task 4: Apply same style language to internal screens

**Files:**
- Modify: `apps/web/src/components/app/app-shell.tsx`
- Modify: `apps/web/src/components/app/page-header.tsx`
- Modify: `apps/web/src/app/login/page.tsx`
- Modify: `apps/web/src/app/trips/new/page.tsx`
- Modify: `apps/web/src/app/approvals/page.tsx`
- Modify: `apps/web/src/app/expenses/page.tsx`
- Test: `apps/web/tests/e2e/personality-polish.spec.ts`

- [ ] **Step 1: Add failing internal-shell test**

```ts
test("internal screens use polished app shell surfaces", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("[data-ui='auth-shell']")).toBeVisible();
  await expect(page.locator("[data-ui='app-shell-header']")).toHaveClass(/backdrop-blur/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts -g "internal screens use polished app shell surfaces"`  
Expected: FAIL (missing markers/classes).

- [ ] **Step 3: Write minimal implementation**

```tsx
// app-shell.tsx
<header data-ui="app-shell-header" className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
```

```tsx
// login/page.tsx
<Card data-ui="auth-shell" className="relative overflow-hidden">
```

```tsx
// page-header.tsx
<div className="mb-8 border-l-2 border-primary/35 pl-4">
```

```tsx
// trips/new, approvals, expenses
// unify container classes to the same polished surface vocabulary:
className="rounded-2xl border border-border/70 bg-card/85 p-6 shadow-[0_12px_36px_rgba(2,6,23,0.08)]"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts -g "internal screens use polished app shell surfaces"`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/app/app-shell.tsx apps/web/src/components/app/page-header.tsx apps/web/src/app/login/page.tsx apps/web/src/app/trips/new/page.tsx apps/web/src/app/approvals/page.tsx apps/web/src/app/expenses/page.tsx apps/web/tests/e2e/personality-polish.spec.ts
git commit -m "feat(web): extend editorial polish to authenticated screens"
```

---

### Task 5: Regression validation and final integration commit

**Files:**
- Test: `apps/web/tests/e2e/personality-polish.spec.ts`
- Test: `apps/web/tests/e2e/critical-flow.spec.ts`
- Optional docs update: `apps/web/README.md` (if visual-check command is documented)

- [ ] **Step 1: Run personality tests**

Run: `npm run test:e2e -w apps/web -- tests/e2e/personality-polish.spec.ts`  
Expected: PASS all tests.

- [ ] **Step 2: Run critical functional flow**

Run: `npm run test:e2e -w apps/web -- tests/e2e/critical-flow.spec.ts`  
Expected: PASS 2/2 tests.

- [ ] **Step 3: Run web build**

Run: `npm run build -w apps/web`  
Expected: Build completes successfully.

- [ ] **Step 4: Commit integrated result**

```bash
git add apps/web
git commit -m "feat(web): ship frontend personality polish across landing and app pages"
```

