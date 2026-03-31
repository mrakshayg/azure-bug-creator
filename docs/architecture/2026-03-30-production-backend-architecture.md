# BugDraft Production Architecture

**Date:** 2026-03-31  
**Status:** Active deployment architecture

## Goal

Ship BugDraft as a deployable Render application with one clean production path:

- PAT-based Azure DevOps login
- PostgreSQL persistence
- server-side sessions
- live Azure DevOps submission
- persistent temporary upload storage

## Final stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Express
- express-session
- Zod
- native fetch

### Persistence

- PostgreSQL
- Prisma

### Hosting

- Render static site for the frontend
- Render web service for the backend
- Render Postgres
- Render persistent disk for temporary uploads

## Architecture decisions

### Auth

- users sign in with:
  - Azure DevOps organization URL
  - project name
  - their own PAT
- backend validates the PAT before creating a session
- browser receives only an `HttpOnly` app session cookie
- PAT stays on the backend in the user’s Azure connection record

### Persistence

- Prisma/Postgres is required
- JSON-file fallback has been removed
- session storage is backed by PostgreSQL
- drafts, attachments, and submissions are backed by PostgreSQL

### Azure submission

- live submission is the only supported mode
- uploaded evidence is first stored on the backend upload disk
- on submit, each file is uploaded to Azure DevOps attachments
- image attachments are embedded inline in Azure work item content

## Repo structure

```text
azure-bug-creator/
  src/                         # frontend
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      app.ts
      server.ts
      config/
      lib/
      middleware/
      repositories/
      routes/
      services/
      types/
  docs/
    architecture/
  render.yaml
```

## Main backend modules

### Routes

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/session`
- `POST /api/v1/auth/logout`
- `GET /api/v1/drafts`
- `POST /api/v1/drafts`
- `GET /api/v1/drafts/:draftId`
- `PUT /api/v1/drafts/:draftId`
- `POST /api/v1/drafts/:draftId/parse`
- `POST /api/v1/drafts/:draftId/attachments`
- `POST /api/v1/drafts/:draftId/submit`

### Services

- `auth-service.ts`
  - validates PAT against Azure DevOps
  - provisions the app user and Azure connection
- `draft-service.ts`
  - creates and updates draft records
- `attachment-service.ts`
  - stores temporary upload files
  - creates attachment rows
- `azure-devops-service.ts`
  - uploads Azure attachments
  - builds the work item payload
  - creates the Azure DevOps bug
- `submission-service.ts`
  - persists submission result metadata

## Database model

### users

- `id`
- `email`
- `displayName`
- `authIdentityKey`
- `createdAt`
- `lastLoginAt`

### sessions

- `id`
- `sessionId`
- `userId`
- `sessionData`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`

### azureConnections

- `id`
- `userId`
- `organizationUrl`
- `projectName`
- `encryptedAccessToken`
- `createdAt`
- `updatedAt`

### bugDrafts

- `id`
- `userId`
- `azureConnectionId`
- `status`
- `description`
- `module`
- `environment`
- `prompt`
- `title`
- `steps`
- `expectedResult`
- `actualResult`
- `priority`
- `severity`
- `parserWarningsJson`
- `createdAt`
- `updatedAt`

### bugAttachments

- `id`
- `draftId`
- `storageKey`
- `fileName`
- `mimeType`
- `sizeBytes`
- `status`
- `azureAttachmentUrl`
- `createdAt`

### bugSubmissions

- `id`
- `draftId`
- `azureBugId`
- `azureBugUrl`
- `requestPayloadJson`
- `responsePayloadJson`
- `submittedAt`
- `status`
- `errorMessage`

## Azure field mapping

BugDraft currently maps reviewed content to:

- `System.Title`
- `Microsoft.VSTS.TCM.ReproSteps`
- `Microsoft.VSTS.TCM.SystemInfo`
- `Microsoft.VSTS.Common.AcceptanceCriteria`
- `Custom.RootCauseAnalysis`
- `Microsoft.VSTS.Common.Priority`
- `Microsoft.VSTS.Common.Severity`

Content mapping:

- steps to reproduce -> `Microsoft.VSTS.TCM.ReproSteps`
- description + environment + bug location + screenshots -> `Microsoft.VSTS.TCM.SystemInfo`
- expected result -> `Microsoft.VSTS.Common.AcceptanceCriteria`
- actual result -> `Custom.RootCauseAnalysis`

## Frontend conventions

- `Module / Bug Location` is free text
- title generation should be location-first
- `Environment` is restricted to:
  - `Dev`
  - `Int`
  - `UAT`
- screenshot step supports:
  - browse
  - drag and drop
  - clipboard paste

## Render deployment shape

### Backend service

- root dir: `backend`
- build:
  - `npm ci`
  - `npm run prisma:generate`
  - `npm run build`
- start:
  - `npm run prisma:migrate:deploy`
  - `npm start`

### Frontend static site

- build:
  - `npm ci`
  - `npm run build`
- publish dir:
  - `dist`
- requires `VITE_API_BASE_URL`

### Persistent upload disk

- mount a Render disk to the backend service
- point `UPLOAD_DIR` at the mounted disk, for example `/var/data/uploads`

## Known product boundary

The dashboard is still local BugDraft history, not a live Azure DevOps status sync. It should show BugDraft state only unless a real Azure pull-sync feature is added later.
