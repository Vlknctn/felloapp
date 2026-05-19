import type { Transaction } from "@/lib/types"

function formatTry(amount: number) {
  return amount.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺"
}

export function buildSpendingSummary(
  transactions: Transaction[],
  period: "today" | "week" | "month" | "last_month",
): string {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  let since: Date
  let until: Date | null = null
  let label: string

  switch (period) {
    case "today":
      since = todayStart
      label = "Bugün"
      break
    case "week":
      since = weekStart
      label = "Son 7 gün"
      break
    case "last_month":
      since = lastMonthStart
      until = lastMonthEnd
      label = "Geçen ay"
      break
    case "month":
    default:
      since = monthStart
      label = "Bu ay"
      break
  }

  const filtered = transactions.filter((tx) => {
    const d = new Date(tx.date)
    if (d < since) return false
    if (until && d > until) return false
    return true
  })

  if (filtered.length === 0) {
    return `${label} için kayıtlı harcama bulunamadı.`
  }

  const total = filtered.reduce((s, tx) => s + Math.abs(tx.amount), 0)
  const byCategory: Record<string, number> = {}
  for (const tx of filtered) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + Math.abs(tx.amount)
  }
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  let text = `${label}: ${filtered.length} işlem, toplam ${formatTry(total)}.`
  if (topCategory) {
    text += ` En yüksek kategori: ${topCategory[0]} (${formatTry(topCategory[1])}).`
  }
  return text
}
