import type { Transaction } from "@/lib/types"
import type { Transaction as DbTransaction } from "@prisma/client"

export function dbToTransaction(row: DbTransaction): Transaction {
  return {
    id: row.id,
    merchant: row.merchant,
    category: row.category,
    amount: row.amount,
    currency: row.currency,
    date: row.date.toISOString(),
    source: row.source as Transaction["source"],
    logoUrl: row.logoUrl ?? "",
  }
}
