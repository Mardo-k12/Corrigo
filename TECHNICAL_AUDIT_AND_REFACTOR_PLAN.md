# Corrigo Technical Audit and Refactor Plan

## Executive Summary

This audit reflects the codebase state after stabilizing the monorepo toolchain and aligning the backend and database around the education domain used by the mobile application.

### What is now working

- Workspace type checking passes.
- API unit tests pass.
- API linting passes with a modern ESLint flat config.
- The smartgrader build script works on Windows and no longer hard-fails when a Replit deployment domain is absent.
- The backend now exposes concrete domain routes for users, courses, students, exams, and grades.
- The database package now defines domain tables matching the actual product.

### What still needs follow-up

- Existing tracked secret and `.env` files must be removed from git history or rotated if they contained real credentials.
- The OpenAPI contract still under-describes the implemented API surface.
- The mobile app is still local-first for auth and most domain persistence; migration to backend-backed storage should be the next product step.
- Documentation files claiming `10/10` production readiness are not all updated to match the verified state.

## Monorepo Architecture

### Applications

- `artifacts/api-server`: Express + TypeScript backend.
- `artifacts/mockup-sandbox`: Vite-based component preview environment, not yet a full business web app.
- `artifacts/smartgrader`: Expo/React Native mobile app.

### Shared libraries

- `lib/db`: Drizzle schemas and DB access.
- `lib/api-zod`: shared request/response and domain schema definitions.
- `lib/integrations-gemini-ai`: Gemini integration.

## Verified Issues Found and Repaired

### 1. Toolchain mismatch in API tests

Problem:

- `jest@30` was installed alongside `ts-jest@29`, causing the API tests to crash before execution.

Repair:

- Aligned the API testing stack to Jest 29.

Result:

- `pnpm -C artifacts/api-server test` now passes.

### 2. Missing ESLint flat config

Problem:

- ESLint 9+ requires `eslint.config.*`, but the API package had none.

Repair:

- Added `artifacts/api-server/eslint.config.mjs` and fixed reported source issues.

Result:

- `pnpm -C artifacts/api-server lint` now passes.

### 3. Fragile Windows mobile build

Problem:

- The smartgrader build assumed a Replit domain and attempted to spawn `pnpm` in a way that failed on Windows.

Repair:

- Added localhost fallback.
- Resolved Windows-specific `pnpm.cmd` handling.
- Sanitized spawned child-process environment.

Result:

- `pnpm -C artifacts/smartgrader build` now completes locally on Windows.

### 4. Domain mismatch between mobile, backend, and DB

Problem:

- Mobile modeled courses/students/exams/grades.
- DB previously exposed only `conversations/messages`.
- Backend only implemented health and AI endpoints.

Repair:

- Added shared domain schemas in `lib/api-zod`.
- Added domain tables in `lib/db`.
- Added education routes and storage orchestration in `artifacts/api-server`.

Result:

- Backend and DB now speak the same domain language as the mobile app.

## Current Backend Domain API

### Implemented endpoints

- `GET /api/users`
- `POST /api/users`
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:courseId/students`
- `POST /api/courses/:courseId/students`
- `GET /api/courses/:courseId/exams`
- `GET /api/exams`
- `POST /api/exams`
- `GET /api/grades`
- `POST /api/grades`
- `PATCH /api/grades/:gradeId`
- `GET /api/healthz`
- `GET /health`
- `POST /api/ai/ocr`
- `POST /api/ai/grade`
- `POST /api/ai/generate-exam`
- `POST /api/ai/summarize-course`

### Persistence behavior

- If `DATABASE_URL` is configured, the API persists with PostgreSQL via Drizzle.
- If `DATABASE_URL` is absent, the API falls back to an in-memory seeded store so local development still works.

## Security Audit

### Risks observed

- Local secret files were tracked in git.
- The repository contains files whose names strongly suggest API key material.

### Repairs applied

- Hardened root `.gitignore` to exclude local `.env` files, `.datadog.env`, and API-key-named local artifacts.

### Manual actions still required

1. Remove tracked secret files from version control.
2. Rotate any real secrets that may already have been committed.
3. Keep only `.env.example` templates in the repo.

## Documentation Audit

### Corrected

- Fixed outdated references from `artifacts/corrigo` to `artifacts/smartgrader` in the primary setup docs.

### Still inconsistent

- Some reports still claim full production readiness and perfect scores without matching the newly verified state.
- OpenAPI still documents only a tiny subset of implemented endpoints.

## Refactor Roadmap

### Phase 1: API contract truthfulness

- Expand `lib/api-spec/openapi.yaml` to cover the implemented education endpoints.
- Regenerate API client and Zod outputs from the updated spec.

### Phase 2: Mobile to backend migration

- Replace local auth with backend-backed auth.
- Move courses/students/exams/grades from AsyncStorage-first to API-first with local caching.
- Introduce React Query on mobile for synchronization and offline-aware invalidation.

### Phase 3: Database lifecycle

- Add real Drizzle migrations for the new education tables.
- Add integration tests against a dedicated test database.

### Phase 4: Web product decision

- Either promote the web package into a real business UI or clearly brand it as a preview sandbox only.

## Verification Commands

The following checks were run successfully after the repairs:

```bash
pnpm typecheck
pnpm -C artifacts/api-server test
pnpm -C artifacts/api-server lint
pnpm -C artifacts/api-server build
pnpm -C artifacts/smartgrader build
```

## Recommendation

The repo is now materially healthier and internally more coherent, but it should be described as a repaired development baseline rather than a fully production-ready system until secrets are cleaned, OpenAPI is updated, and the mobile app is migrated to backend-backed persistence.