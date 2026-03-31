import 'dotenv/config'

import { defineConfig } from 'prisma/config'

// `prisma generate` loads this config but does not connect. CI/Render builds may not
// have DATABASE_URL yet; runtime always uses the real URL from env (see src/config/env.ts).
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5432/postgres'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
})
