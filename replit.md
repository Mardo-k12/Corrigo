# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **artifacts/api-server** — Express API. Hosts CORRIGO AI routes (Gemini OCR + grading) at `/api/ai/*` using `@google/genai` (model `gemini-2.5-flash`). Requires `GEMINI_API_KEY`.
- **artifacts/smartgrader** — Expo app for UPC teachers. Auth, courses, exam scanner, AI auto-grading, students, exam generator and dashboards now run backend-first through the Express API. French UI, UPC blue (#1e3a8a) + white. Calls the API through `lib/api.ts` using `EXPO_PUBLIC_DOMAIN`.
- **artifacts/mockup-sandbox** — UI sandbox (default).

## Web compatibility notes (Expo + react-native-web 0.21)

- **Do NOT use `<Link asChild>` from `expo-router`** on react-native-web 0.21 + React 19 — it triggers `setValueForStyle … Indexed property setter is not supported`. Use `<Pressable onPress={() => router.push(...)}>` instead.
- Use `Platform.select` to apply `boxShadow` on web instead of RN `shadow*` props (they error on react-native-web 0.21).
- Wrap `KeyboardProvider` with `Platform.OS !== "web"` and use `components/KeyboardAwareScrollViewCompat.tsx` (falls back to `ScrollView` on web).
- Avoid `LinearGradient` on web — replace with a plain `View` with `backgroundColor`.
