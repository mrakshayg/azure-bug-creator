import { redactSensitive } from './redaction.js'

function sanitizeArgs(args: unknown[]) {
  return args.map((arg) => redactSensitive(arg))
}

export const logger = {
  info: (...args: unknown[]) => console.log('[api]', ...sanitizeArgs(args)),
  error: (...args: unknown[]) => console.error('[api]', ...sanitizeArgs(args)),
}
