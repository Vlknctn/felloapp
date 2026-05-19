import { prisma } from "@/server/db/prisma"
import { env } from "@/server/config/env"
import type { Transaction } from "@/lib/types"
import { dbToTransaction } from "./mapper"

export async function listTransactions(userId = env.felloUserId): Promise<Transaction[]> {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  })
  return rows.map(dbToTransaction)
}

export async function getTransactionById(
  id: string,
  userId = env.felloUserId,
): Promise<Transaction | null> {
  const row = await prisma.transaction.findFirst({ where: { id, userId } })
  return row ? dbToTransaction(row) : null
}

export async function createTransaction(
  input: {
    id?: string
    merchant: string
    category: string
    amount: number
    currency?: string
    date?: Date
    source?: Transaction["source"]
    logoUrl?: string
  },
  userId = env.felloUserId,
): Promise<Transaction> {
  const row = await prisma.transaction.create({
    data: {
      id: input.id ?? `txn_${Date.now()}`,
      userId,
      merchant: input.merchant,
      category: input.category,
      amount: input.amount,
      currency: input.currency ?? "TRY",
      date: input.date ?? new Date(),
      source: input.source ?? "manual",
      logoUrl: input.logoUrl ?? "",
    },
  })
  return dbToTransaction(row)
}

export async function upsertTransactions(
  transactions: Transaction[],
  userId = env.felloUserId,
): Promise<number> {
  let count = 0
  for (const tx of transactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      create: {
        id: tx.id,
        userId,
        merchant: tx.merchant,
        category: tx.category,
        amount: tx.amount,
        currency: tx.currency,
        date: new Date(tx.date),
        source: tx.source,
        logoUrl: tx.logoUrl || null,
      },
      update: {
        merchant: tx.merchant,
        category: tx.category,
        amount: tx.amount,
        currency: tx.currency,
        date: new Date(tx.date),
        source: tx.source,
        logoUrl: tx.logoUrl || null,
      },
    })
    count++
  }
  return count
}

export async function countTransactions(userId = env.felloUserId): Promise<number> {
  return prisma.transaction.count({ where: { userId } })
}
