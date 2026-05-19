import { mockUser } from "@/lib/data"
import type { Transaction } from "@/lib/types"
import { env } from "@/server/config/env"

export function formatTransactionMemory(
  tx: Transaction,
  userName = mockUser.name,
  userId = env.felloUserId,
): { text: string; metadata: Record<string, unknown> } {
  const date = new Date(tx.date)
  const dateStr = date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const amount = Math.abs(tx.amount).toLocaleString("tr-TR", { maximumFractionDigits: 2 })

  const text = `${userName}, ${dateStr} tarihinde ${tx.merchant} markasına ${amount} ${tx.currency} ${tx.category} harcaması yaptı. Kaynak: ${tx.source}.`

  return {
    text,
    metadata: {
      userId,
      transactionId: tx.id,
      merchant: tx.merchant,
      category: tx.category,
      amount: tx.amount,
      currency: tx.currency,
      source: tx.source,
      date: tx.date,
    },
  }
}
