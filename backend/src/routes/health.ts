import { Router } from 'express'

import { checkPrismaHealth } from '../lib/prisma.js'

export const healthRouter = Router()

healthRouter.get('/health', async (_req, res) => {
  const database = await checkPrismaHealth()

  res.json({
    status: database.enabled && !database.healthy ? 'degraded' : 'ok',
    authMode: 'pat',
    azureMode: 'live',
    database,
  })
})
