import type { NextFunction, Request, Response } from 'express'

import { redactSensitive } from '../lib/redaction.js'

const INSPECT_CUSTOM = Symbol.for('nodejs.util.inspect.custom')

function attachRedactedSerializers(payload: Record<string, unknown>) {
  Object.defineProperty(payload, 'toJSON', {
    value: () => redactSensitive(payload),
    configurable: true,
    enumerable: false,
    writable: false,
  })

  Object.defineProperty(payload, INSPECT_CUSTOM, {
    value: () => redactSensitive(payload),
    configurable: true,
    enumerable: false,
    writable: false,
  })
}

export function redactAuthBody(req: Request, _res: Response, next: NextFunction) {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    attachRedactedSerializers(req.body as Record<string, unknown>)
  }

  next()
}
