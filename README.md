# BugDraft

BugDraft is a React + Vite frontend with a Node + TypeScript backend for turning QA notes, AI output, and screenshots into Azure DevOps bug work items.

## What it does

1. user writes the bug in plain English
2. user enters the exact bug location
3. app generates a strict AI prompt
4. user pastes structured AI output
5. user reviews and edits the parsed bug
6. user uploads or pastes screenshots
7. app creates the Azure DevOps bug

## Current architecture

- frontend: React + Vite
- backend: Express + TypeScript
- persistence: Prisma + PostgreSQL
- auth: Azure DevOps PAT validation with server-side session cookies
- uploads: temporary file storage plus Azure WIT attachment upload on submit

The old prototype-only branches are gone:

- no Entra / OAuth flow
- no stub auth mode
- no mock Azure mode
- no JSON-file persistence fallback

## Product behavior

- PAT login with organization URL, project, and user PAT
- module is free-text `Module / Bug Location`
- environments are `Dev`, `Int`, `UAT`
- screenshots can be added by browse, drag-and-drop, or clipboard paste
- uploaded screenshots are embedded into the Azure work item content
- final screen tells the user to open Azure and complete:
  - Assign People
  - Add Tags
  - Set Area
  - Set Iteration

## Dashboard semantics

The dashboard is local BugDraft history, not a live Azure status mirror.

- `Draft` = draft exists in BugDraft
- `Submitted to Azure` = BugDraft created the work item

## Local development

### 1. Frontend

```bash
npm install
npm run dev:web -- --host 127.0.0.1 --port 5173
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

## Render deployment

This repo is structured for Render deployment through the root [render.yaml](render.yaml) (Supabase Postgres):

- one backend web service from `backend/`
- one frontend static site from the repo root
 - Supabase provides `DATABASE_URL` (set it in the Render service environment)

If you deploy as a **single Render web service** (frontend served by backend), set:

- Root Directory: repo root (empty)
- Build Command: `npm ci && npm run ci:api && npm run prisma:generate && npm run build`
- Start Command: `npm run prisma:migrate:deploy && npm start`

Set these values for production:

- backend:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `FRONTEND_ORIGIN`
  - `UPLOAD_DIR`
- frontend:
  - `VITE_API_BASE_URL`

The frontend now reads `VITE_API_BASE_URL` so the static site can call the Render API service.

Recommended first deploy sequence:

1. create the backend service and attach the persistent upload disk
2. set `DATABASE_URL` from Supabase in Render
3. let the backend run `prisma migrate deploy`
4. create the frontend static site
5. verify:
   - `/api/v1/health`
   - PAT login
   - draft creation
   - screenshot upload
   - Azure bug creation

## Verification

```bash
npm test
npm run build
cd backend && npm run check
```
