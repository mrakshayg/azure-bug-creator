import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().optional())

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().url().optional())

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_ORIGIN: z.string().url().default('http://127.0.0.1:5173'),
  SESSION_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  UPLOAD_DIR: z.string().default('./storage/uploads'),
  AZURE_DEVOPS_ORG_URL: optionalUrl,
  AZURE_DEVOPS_PROJECT: optionalString,
  AZURE_DEVOPS_API_VERSION: z.string().default('7.1'),
})

export const env = envSchema.parse(process.env)
