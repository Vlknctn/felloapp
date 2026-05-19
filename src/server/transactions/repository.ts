import { mockTransactions } from "@/lib/data"
import { prisma } from "@/server/db/prisma"
import { env, useInMemoryDemoStore } from "@/server/config/env"
import type { Transaction } from "@/lib/types"
import { dbToTransaction } from "./mapper"

function demoTransactionsFallback(): Transaction[] {
  return [...mockTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export async function listTransactions(userId = env.felloUserId): Promise<Transaction[]> {
  if (useInMemoryDemoStore()) return demoTransactionsFallback()

  try {
    const rows = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    })
    if (rows.length === 0 && env.demoMode) return demoTransactionsFallback()
    return rows.map(dbToTransaction)
  } catch {
    if (env.demoMode) return demoTransactionsFallback()
    throw new Error("database_unavailable")
  }
}

export async function getTransactionById(
  id: string,
  userId = env.felloUserId,
): Promise<Transaction | null> {
  if (useInMemoryDemoStore()) {
    return demoTransactionsFallback().find((t) => t.id === id) ?? null
  }

  try {
    const row = await prisma.transaction.findFirst({ where: { id, userId } })
    return row ? dbToTransaction(row) : null
  } catch {
    if (env.demoMode) {
      return demoTransactionsFallback().find((t) => t.id === id) ?? null
    }
    throw new Error("database_unavailable")
  }
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
  if (useInMemoryDemoStore()) {
    const date = input.date ?? new Date()
    return {
      id: input.id ?? `txn_${Date.now()}`,
      merchant: input.merchant,
      category: input.category,
      amount: input.amount,
      currency: input.currency ?? "TRY",
      date: date.toISOString(),
      source: input.source ?? "manual",
      logoUrl: input.logoUrl ?? "",
    }
  }

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
  if (useInMemoryDemoStore()) return transactions.length

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
  if (useInMemoryDemoStore()) return mockTransactions.length

  try {
    return await prisma.transaction.count({ where: { userId } })
  } catch {
    if (env.demoMode) return mockTransactions.length
    throw new Error("database_unavailable")
  }
}
