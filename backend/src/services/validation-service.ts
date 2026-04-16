import { z } from 'zod'

export const draftPayloadSchema = z.object({
  description: z.string().default(''),
  module: z.string().default(''),
  environment: z.string().default(''),
  prompt: z.string().default(''),
  title: z.string().default(''),
  steps: z.string().default(''),
  expectedResult: z.string().default(''),
  actualResult: z.string().default(''),
  priority: z.string().default(''),
  severity: z.string().default(''),
  linkedUserStoryId: z.string().default(''),
  linkedUserStoryMode: z.enum(['Child', 'Related']).default('Child'),
  parserWarnings: z.array(z.string()).default([]),
})

export function validateSubmitPayload(payload: z.infer<typeof draftPayloadSchema>) {
  const required = ['title', 'steps', 'expectedResult', 'actualResult'] as const
  const missing = required.filter((field) => !payload[field]?.trim())

  return {
    ok: missing.length === 0,
    missing,
  }
}
