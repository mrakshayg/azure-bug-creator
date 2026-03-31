# Supabase (PostgreSQL) for BugDraft

Supabase is hosted PostgreSQL. This app already uses Prisma with `provider = "postgresql"`, so you only point **`DATABASE_URL`** at your Supabase project—no code migration away from Postgres.

## 1. Create a project

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project** (free tier is fine).
2. Set a database password and region; wait until the project is ready.

## 2. Connection string

1. **Project Settings** → **Database**.
2. Under **Connection string**, choose **URI**.
3. Use **Direct connection** (port **5432**), not the pooler, so `prisma migrate deploy` works reliably.
4. Replace `[YOUR-PASSWORD]` with your database password.
5. Ensure the URL uses SSL. If the client complains, append:

   `?sslmode=require`

Use the **exact** string from the dashboard (usually host `db.<project-ref>.supabase.co`, port `5432`). Copy it; do not commit it to git.

## 3. Local backend

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL to the Supabase URI above.
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

You can **skip** local Docker Postgres (`docker compose`) when using Supabase.

## 4. Render

1. On the **API** web service → **Environment**, add **`DATABASE_URL`** (paste the same URI; mark as **Secret**).
2. Do **not** rely on Render’s managed Postgres for this setup unless you prefer it; one database is enough.
3. If you use a Blueprint, use **`render.supabase.yaml`** (no Render DB resource) or remove the `databases` block and `fromDatabase` wiring from `render.yaml`, then set **`DATABASE_URL`** manually.

## 5. Optional: separate dev database

Create a second Supabase project (or use local Docker Postgres) if you want production data isolated from local testing.
