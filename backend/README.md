# Backend

## Production path

The backend now supports one deployment path only:

- PAT-based Azure DevOps login
- live Azure DevOps submission
- Prisma + PostgreSQL persistence
- Express session storage in PostgreSQL

Removed from the active architecture:

- Entra / OAuth session flow
- stub auth mode
- mock Azure submission mode
- JSON-file fallback persistence

## Required environment variables

Copy `.env.example` to `.env` and set:

- `SESSION_SECRET`
- `DATABASE_URL`
- `FRONTEND_ORIGIN`

Optional defaults already included:

- `AZURE_DEVOPS_ORG_URL`
- `AZURE_DEVOPS_PROJECT`
- `AZURE_DEVOPS_API_VERSION`

Optional fallback only:

- `AZURE_DEVOPS_PAT`

## Local development

1. Start Postgres.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm run prisma:generate`.
5. Run `npm run prisma:migrate:deploy`.
6. Run `npm run dev`.

The local Docker setup uses:

- `DATABASE_URL=postgresql://bugdraft:bugdraft@127.0.0.1:5432/bugdraft`

## Render deployment

Deploy this backend as a Render web service with:

- root directory: `backend`
- build command: `npm ci && npm run prisma:generate && npm run build`
- start command: `npm run prisma:migrate:deploy && npm start`
- a Render Postgres database connected through `DATABASE_URL`
- a persistent disk mounted for `UPLOAD_DIR`

Recommended upload disk path:

- `UPLOAD_DIR=/var/data/uploads`

Use `render.yaml` at the repo root for the full blueprint.

## Current Azure work item mapping

- `System.Title`
- `Microsoft.VSTS.TCM.ReproSteps`
- `Microsoft.VSTS.TCM.SystemInfo`
- `Microsoft.VSTS.Common.AcceptanceCriteria`
- `Custom.RootCauseAnalysis`
- `Microsoft.VSTS.Common.Priority`
- `Microsoft.VSTS.Common.Severity`

Current content mapping:

- steps to reproduce -> `Microsoft.VSTS.TCM.ReproSteps`
- description + bug location + environment + embedded screenshots -> `Microsoft.VSTS.TCM.SystemInfo`
- expected result -> `Microsoft.VSTS.Common.AcceptanceCriteria`
- actual result -> `Custom.RootCauseAnalysis`

## Attachment behavior

1. frontend uploads evidence to BugDraft
2. backend stores temporary files on the mounted upload disk
3. on submit, backend uploads each file to Azure DevOps WIT attachments
4. image attachments are embedded inline in Azure
5. non-image attachments are linked in the work item content
