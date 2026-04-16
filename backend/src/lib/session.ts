import session from 'express-session'

import { env } from '../config/env.js'
import { getPrismaClient } from './prisma.js'

class PrismaSessionStore extends session.Store {
  override get(sid: string, callback: (err?: unknown, session?: session.SessionData | null) => void) {
    void (async () => {
      try {
        const prisma = await getPrismaClient()
        if (!prisma) return callback(undefined, null)

        const record = await prisma.session.findUnique({
          where: { sessionId: sid },
        })

        if (!record || record.revokedAt || record.expiresAt <= new Date()) {
          return callback(undefined, null)
        }

        callback(undefined, record.sessionData as session.SessionData)
      } catch (error) {
        callback(error)
      }
    })()
  }

  override set(sid: string, sess: session.SessionData, callback?: (err?: unknown) => void) {
    void (async () => {
      try {
        const prisma = await getPrismaClient()
        if (!prisma) return callback?.()

        const expiresAt = sess.cookie?.expires
          ? new Date(sess.cookie.expires)
          : new Date(Date.now() + 1000 * 60 * 30)

        await prisma.session.upsert({
          where: { sessionId: sid },
          update: {
            userId: sess.user?.id ?? null,
            sessionData: sess as unknown as object,
            expiresAt,
            revokedAt: null,
          },
          create: {
            sessionId: sid,
            userId: sess.user?.id ?? null,
            sessionData: sess as unknown as object,
            expiresAt,
          },
        })

        callback?.()
      } catch (error) {
        callback?.(error)
      }
    })()
  }

  override destroy(sid: string, callback?: (err?: unknown) => void) {
    void (async () => {
      try {
        const prisma = await getPrismaClient()
        if (!prisma) return callback?.()

        await prisma.session.updateMany({
          where: { sessionId: sid },
          data: { revokedAt: new Date() },
        })

        callback?.()
      } catch (error) {
        callback?.(error)
      }
    })()
  }

  override touch(sid: string, sess: session.SessionData, callback?: () => void) {
    void (async () => {
      const prisma = await getPrismaClient()
      if (prisma) {
        const expiresAt = sess.cookie?.expires
          ? new Date(sess.cookie.expires)
          : new Date(Date.now() + 1000 * 60 * 30)

        await prisma.session.updateMany({
          where: { sessionId: sid, revokedAt: null },
          data: { expiresAt, sessionData: sess as unknown as object },
        })
      }

      callback?.()
    })()
  }
}

export function createSessionMiddleware() {
  const isProduction = env.NODE_ENV === 'production'

  return session({
    name: 'bugdraft_session',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 30,
    },
  })
}
