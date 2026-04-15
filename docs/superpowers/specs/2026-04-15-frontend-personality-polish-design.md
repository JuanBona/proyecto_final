# Frontend Personality Polish Design (Task 6 extension)

## Problem

The frontend currently works and is clean, but still feels visually generic in some areas. The goal is to preserve the premium/minimal direction while adding stronger personality and crafted details across both the landing and internal app screens.

## Goals

1. Reduce the “template/AI-like” feeling with intentional visual identity.
2. Keep motion subtle and refined.
3. Apply a consistent style language across public and authenticated surfaces.
4. Preserve accessibility and responsive behavior.

## Non-goals

1. No redesign of business flows.
2. No backend/API behavior changes.
3. No heavy/flashy animation style.

## Proposed Approach (Approved)

Use a **hybrid approach**:

1. Immediate visual polish (editorial-elegant personality) in key UI surfaces.
2. Add a small reusable styling foundation so future screens stay consistent.

## Visual Direction

1. **Editorial elegant** aesthetic with restrained contrast and generous spacing.
2. Refined layered surfaces:
   - Soft border + subtle shadow combinations.
   - Optional low-opacity grain/texture accent on key sections.
3. Typography rhythm improvements:
   - Tighter heading hierarchy.
   - Better subtitle legibility and spacing cadence.
4. Distinct but restrained accents:
   - Line accents, soft gradients, and premium focus states.

## Motion & Interaction

1. Card/button hover: micro-lift (2-4px) with soft transform.
2. Section reveals: short duration, small stagger, no dramatic movement.
3. Navigation feedback: animated underline and polished active/hover/focus behavior.
4. Hero/CTA depth: very subtle animated gradient treatment.

## Scope

### Public pages

1. Navbar
2. Hero
3. Features
4. CTA
5. Footer

### Internal pages

1. Shared app frame/shell styling
2. Form cards and field surfaces
3. Listing/queue cards and empty states
4. Button hierarchy and interaction states

## Component Strategy

1. Introduce reusable surface variants (e.g., `soft`, `elevated`, `inset`) through existing UI primitives/classes.
2. Keep changes modular inside `marketing/*`, shared `ui/*`, and page-level wrappers.
3. Avoid duplicated per-page styling logic.

## Data Flow & State Impact

1. No API contract changes.
2. No auth/session logic changes.
3. Visual updates only; existing page state/actions remain unchanged.

## Accessibility & UX Constraints

1. Maintain visible focus indicators on keyboard navigation.
2. Keep text/background contrast compliant.
3. Avoid motion patterns that create distraction.
4. Preserve mobile-first behavior and readable spacing on small screens.

## Error Handling

1. Existing error and empty states remain functional.
2. Improve visual clarity of state containers without changing semantics.

## Validation Plan

1. Manual verification of landing and authenticated pages in light/dark.
2. Ensure interactive states are visible (hover/focus/active).
3. Keep current e2e flow compatible.

## Risks & Mitigations

1. **Risk:** Over-styling breaks minimal tone.  
   **Mitigation:** cap saturation, keep motion amplitudes low, review per section.
2. **Risk:** Inconsistent style application across pages.  
   **Mitigation:** centralize surface variants and reuse.
3. **Risk:** Accessibility regressions.  
   **Mitigation:** enforce focus visibility and contrast checks during implementation.

