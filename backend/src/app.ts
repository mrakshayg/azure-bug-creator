import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import { createSessionMiddleware } from './lib/session.js'
import { errorHandler } from './middleware/error-handler.js'
import { attachmentsRouter } from './routes/attachments.js'
import { authRouter } from './routes/auth.js'
import { draftsRouter } from './routes/drafts.js'
import { healthRouter } from './routes/health.js'
import { submissionsRouter } from './routes/submissions.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }))
  app.use(express.json({ limit: '2mb' }))
  app.use(createSessionMiddleware())

  app.use('/api/v1', healthRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1', draftsRouter)
  app.use('/api/v1', attachmentsRouter)
  app.use('/api/v1', submissionsRouter)

  app.use(errorHandler)

  return app
}
