import type { NextFunction, Request, Response } from 'express'

import { ZodError } from 'zod'

import { logger } from '../lib/logger.js'

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error)
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      details: error.flatten(),
    })
  }

  if (
    typeof error === 'object'
    && error !== null
    && 'type' in error
    && error.type === 'entity.too.large'
  ) {
    return res.status(413).json({
      error: 'payload_too_large',
      message: 'The request is too large. Remove large inline image data and try again.',
    })
  }

  if (
    typeof error === 'object'
    && error !== null
    && 'status' in error
    && typeof error.status === 'number'
  ) {
    logger.error({
      message: 'Request failed',
      method: req.method,
      path: req.path,
      error,
    })
    return res.status(error.status).json({
      error: 'request_failed',
      message: error instanceof Error ? error.message : 'Request failed.',
    })
  }

  logger.error({
    message: 'Unhandled error',
    method: req.method,
    path: req.path,
    error,
  })

  return res.status(500).json({
    error: 'internal_server_error',
    message: error instanceof Error ? error.message : 'Internal server error.',
  })
}
