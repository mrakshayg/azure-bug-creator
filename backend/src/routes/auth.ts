import { Router } from 'express'
import type { Request } from 'express'
import { z } from 'zod'

import { loginWithPersonalAccessToken } from '../services/auth-service.js'

export const authRouter = Router()

function saveSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.save((error: unknown) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

authRouter.get('/login', async (req, res) => {
  return res.status(405).json({
    error: 'method_not_allowed',
    message: 'PAT auth uses POST /api/v1/auth/login.',
  })
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = z.object({
      organizationUrl: z.string().url(),
      projectName: z.string().min(1),
      pat: z.string().min(1),
    }).parse(req.body)

    const user = await loginWithPersonalAccessToken(body)
    req.session.user = user
    await saveSession(req)

    return res.json({
      mode: 'pat',
      authenticated: true,
      user,
    })
  } catch (error) {
    return next(error)
  }
})

authRouter.get('/session', (req, res) => {
  if (!req.session.user) {
    return res.json({ authenticated: false, mode: 'pat' })
  }

  return res.json({
    authenticated: true,
    mode: 'pat',
    user: req.session.user,
  })
})

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error)

    res.clearCookie('bugdraft_session')
    return res.status(204).send()
  })
})
