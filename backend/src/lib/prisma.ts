import { env } from '../config/env.js'

let prismaClient: any = null

export async function getPrismaClient(): Promise<any> {
  if (!prismaClient) {
    const prismaModule = await import('@prisma/client') as any
    const adapterModule = await import('@prisma/adapter-pg') as any
    const pgModule = await import('pg') as any
    const PrismaClientCtor = prismaModule.PrismaClient ?? prismaModule.default?.PrismaClient
    const PrismaPg = adapterModule.PrismaPg ?? adapterModule.default?.PrismaPg
    const Pool = pgModule.Pool ?? pgModule.default?.Pool

    if (PrismaClientCtor && PrismaPg && Pool) {
      const pool = new Pool({
        connectionString: env.DATABASE_URL,
      })
      prismaClient = new PrismaClientCtor({
        adapter: new PrismaPg(pool),
      })
    } else {
      prismaClient = null
    }
  }

  return prismaClient
}

export async function checkPrismaHealth() {
  try {
    const prisma = await getPrismaClient()
    if (!prisma) {
      return {
        enabled: true,
        healthy: false,
      }
    }

    await prisma.$queryRaw`SELECT 1`
    return {
      enabled: true,
      healthy: true,
    }
  } catch {
    return {
      enabled: true,
      healthy: false,
    }
  }
}
