import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client/index'
import { Pool } from 'pg'
import { env } from '../config/env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaPg(new Pool({ connectionString: env.DATABASE_URL }))

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ['query'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
