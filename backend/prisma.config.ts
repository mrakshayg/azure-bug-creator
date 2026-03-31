import 'dotenv/config'

import { defineConfig } from 'prisma/config'

const fromEnv = process.env.DATABASE_URL?.trim()

// Only `prisma generate` may run without a real DB (CI / Render build before env is linked).
// `prisma migrate deploy` and anything else must use DATABASE_URL — never a localhost fallback.
const buildTimePlaceholder =
  'postgresql://postgres:postgres@127.0.0.1:5432/postgres'

let datasourceUrl: string
if (fromEnv) {
  datasourceUrl = fromEnv
} else if (process.argv.includes('generate')) {
  datasourceUrl = buildTimePlaceholder
} else {
  throw new Error(
    'DATABASE_URL is not set. In Render: create or link a PostgreSQL instance, then add DATABASE_URL (use the Internal Database URL on the web service Environment tab).'
  )
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: datasourceUrl,
  },
})
