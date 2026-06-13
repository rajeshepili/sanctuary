# Sanctuary Code Nomenclature Guidelines

Sanctuary uses a strict **Feature-Sliced Design** to ensure scalability, maintainability, and clear separation of concerns between frontend and backend operations in our local-first architecture. 

## 1. Feature Structure

All business logic is isolated into domains within the `src/features/` directory (e.g., `habits`, `journal`, `preferences`). Inside each feature, logic is strictly separated into specific `.ts` layers.

### Standard Layer Suffixes:
*   **`[feature].api.ts`**: TanStack Start Server Functions (`createServerFn`). These act as the network boundary between the client and the local server. They MUST strictly validate input via Zod and offload business logic to the service layer.
*   **`[feature].service.ts`**: Backend-only business logic. This is the **only** layer permitted to directly import and query Drizzle (`getDb()`). Function names should end with `Service` (e.g., `getAllHabitsService`).
*   **`[feature].schema.ts`**: Zod validation schemas for API endpoints and form boundaries.
*   **`[feature].options.ts`**: TanStack Query configurations (`queryOptions`). This abstracts query keys and fetching logic away from UI components.
*   **`[feature].mutations.ts`**: Custom React hooks wrapping TanStack Query mutations (e.g., `useHabitsMutations()`). These handle calling the API and orchestrating cache updates.
*   **`[feature].cache.ts`**: Optimistic UI and React Query cache invalidation helpers.
*   **`[feature].selectors.ts`**: Pure functions for deriving data or performing complex UI state calculations (e.g., `calculateConsistency`).
*   **`[feature].errors.ts`**: Domain-specific error classes extending `SanctuaryError` (e.g., `HabitError`).
*   **`[feature].keys.ts`**: Query key factories for React Query.

## 2. Component Naming
*   **React Components**: Always use `PascalCase.tsx`.
    *   *Example*: `IdentityListPane.tsx`, `JournalEditor.tsx`.
*   **Sub-components/Locals**: If a component is only used within a specific feature, it must reside in `src/features/[feature]/components/`.
*   **Global Components**: Shared generic UI (buttons, cards) live in `src/components/ui/` and structural components live in `src/components/layout/`.

## 3. Hook Naming
*   **React Hooks**: Always use `useCamelCase.ts` or `useCamelCase.tsx`.
    *   *Example*: `useEntryEditor.ts`, `useMediaPicker.ts`.

## 4. Utility Functions
*   **Pure Utilities**: Non-React utility functions should be placed in `src/utils/` (or `[feature].selectors.ts` if feature-bound) and named using `camelCase.ts`.
    *   *Example*: `date.ts`, `string.ts`. Function names should describe the action (`toLocalDateString`).

## 5. Database & Schema
*   **Table Names**: Database tables defined in `src/database/schema.ts` should be exported as `camelCase` plurals to map smoothly to JavaScript objects.
    *   *Example*: `export const journalEntries = sqliteTable(...)`
*   **Database Scripts**: Use simple noun-based filenames for database operations in `src/database/` (e.g., `seed.ts`, `purge.ts`, `metrics.ts`, `jobs.ts`).

---
By adhering strictly to this predictable nomenclature, developers can immediately understand the boundary (client vs. server) and purpose of any file within the Sanctuary ecosystem simply by reading its suffix.
