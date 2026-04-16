import cors from 'cors'
import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const webDistDir = join(currentDir, '../../dist')
  const webIndexPath = join(webDistDir, 'index.html')

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

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

  // In single-service deployments, serve the built React app from the API service.
  if (existsSync(webIndexPath)) {
    app.use(express.static(webDistDir))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next()
      return res.sendFile(webIndexPath)
    })
  }

  app.use(errorHandler)

  return app
}
