# Secret Rotation and Repository Recovery

> Current incident status: `origin/main` was rewritten on 2026-07-04 from the sanitized worktree to remove tracked secret-bearing files from published git history. History cleanup is complete; secret rotation and team resynchronization remain mandatory.

## What Was Completed

- Historical files such as local `.env*`, `.datadog.env`, and API-key-named local artifacts were removed from the published git history.
- The sanitized branch replaced `origin/main` using a protected `--force-with-lease` push.
- Placeholder secret-like values were neutralized in tracked templates and docs.

This cleanup reduces future exposure, but it does **not** make previously exposed credentials safe.

## Immediate Mandatory Actions

Complete these actions in order:

1. Freeze production and staging credential changes until rotation is coordinated.
2. Rotate every secret that may have existed in any tracked file, local clone, CI secret store, hosting platform, or log export.
3. Invalidate active sessions or tokens if they depend on rotated secrets.
4. Update environment variables everywhere the app runs.
5. Re-sync all collaborators to the rewritten repository history.

## Corrigo Secret Inventory

Review and rotate at least the following values if they were ever real:

- `GEMINI_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS` or any Google service-account credential path/content
- `JWT_SECRET`
- `SENTRY_DSN`
- `DATADOG_API_KEY`
- `DATADOG_APP_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- SMTP credentials
- Any Expo/EAS or mobile build secret
- Any GitHub Actions, Replit, Vercel, Render, Railway, Docker, or hosting secrets derived from local `.env` files

## Provider Rotation Checklist

### Google AI / Gemini / Google Cloud

1. Revoke the exposed key or service-account credential.
2. Create a new key or service-account credential with the minimum required scope.
3. Replace the value in local development env files and deployment secret stores.
4. Review recent Google Cloud usage and audit logs for suspicious requests.

### JWT and Session Security

1. Generate a new `JWT_SECRET` with high entropy.
2. Redeploy the backend with the new secret.
3. Force logout existing sessions if issued tokens must become invalid immediately.

### Sentry and DataDog

1. Revoke and recreate ingestion or application keys where applicable.
2. Update backend, CI, and monitoring environments.
3. Verify new events arrive after redeploy.

### Database and Redis

1. Change the database or cache password/connection string.
2. Update all services and CI jobs consuming those values.
3. Verify connections and rotate connection pools if required by the provider.

### GitHub and Deployment Platforms

1. Update repository secrets, environment secrets, and organization secrets.
2. Update secrets in every hosting target.
3. Redeploy all environments after the values are replaced.

## Team Recovery Procedure

### Recommended: Fresh Clone

This is the safest option for most collaborators.

```bash
git clone https://github.com/Mardo-k12/Corrigo.git
cd Corrigo
pnpm install
cp .env.example .env.local
```

Then recreate local env files from the new rotated values only.

### Existing Clean Clone

Use this only if there are no local changes to keep.

```bash
git fetch origin
git checkout main
git reset --hard origin/main
git clean -fd
```

### Existing Dirty Clone

Use this when local work must be preserved.

1. Save local work in a branch, patch, or separate backup folder.
2. Prefer a fresh clone instead of trying to repair the old clone in place.
3. Re-apply only the needed local changes onto the rewritten history.

Suggested backup flow:

```bash
git status
git switch -c backup/local-work-before-reclone
git add -A
git commit -m "Backup local work before sanitized-history recovery"
```

If the local changes should not be committed, copy the modified files out of the repository before re-cloning.

## Maintainer Verification Commands

Use these checks after rotation and re-sync:

```bash
git fetch origin
git log --oneline -1 origin/main
git grep -nE "AIza|GEMINI|JWT_SECRET|SENTRY_DSN|DATADOG_API_KEY|DATABASE_URL" -- . ":(exclude)pnpm-lock.yaml"
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Notes:

- `git grep` should only return safe templates, docs, or placeholder references that are intentionally non-secret.
- Any real credential that still appears in tracked files must be removed immediately.

## Communication Template

Send a short incident update to collaborators:

> The repository history was rewritten on 2026-07-04 to remove previously tracked secret-bearing files. Please stop using any previously shared local env values, rotate all credentials you control, and re-clone the repository before resuming work. Do not merge old clones into `main`.

## Definition of Done

The incident can be considered closed only when all items below are true:

- All potentially exposed secrets have been rotated.
- All deployment targets use the new values.
- Collaborators have re-synced to the rewritten history.
- CI passes with the new configuration.
- No real secret remains in tracked files or documentation.
- Monitoring confirms normal post-rotation behavior.
