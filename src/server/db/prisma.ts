// Prisma reads DATABASE_URL from schema; align with env.ts default when .env is missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db"
}

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
