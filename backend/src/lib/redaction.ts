const REDACTED = '[REDACTED]'
const SENSITIVE_KEYS = new Set([
  'pat',
  'token',
  'accessToken',
  'authorization',
  'password',
  'cookie',
  'sessionId',
  'sessionID',
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function redactByKey(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(key)) {
    return REDACTED
  }
  return value
}

function cloneError(error: Error): Record<string, unknown> {
  return {
    ...error,
    name: error.name,
    message: error.message,
    stack: error.stack,
  }
}

export function redactSensitive(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value !== 'object') {
    return value
  }

  if (seen.has(value)) {
    return '[Circular]'
  }
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen))
  }

  const source = value instanceof Error ? cloneError(value) : value
  if (!isPlainObject(source)) {
    return source
  }

  const redacted: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(source)) {
    redacted[key] = redactSensitive(redactByKey(key, item), seen)
  }

  return redacted
}
