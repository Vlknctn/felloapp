import type { Transaction } from "./types"

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function generateTransactionAnalysis(
  transaction: Transaction,
  allTransactions: Transaction[]
): string {
  const now = new Date()
  const txDate = new Date(transaction.date)
  const merchant = transaction.merchant
  const category = transaction.category

  const merchantThisMonth = allTransactions.filter(
    (tx) => tx.merchant === merchant && isSameMonth(new Date(tx.date), now)
  )
  const merchantCount = merchantThisMonth.length

  const categoryThisMonth = allTransactions.filter(
    (tx) => tx.category === category && isSameMonth(new Date(tx.date), now)
  )
  const categoryLastMonth = allTransactions.filter((tx) => {
    const d = new Date(tx.date)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return tx.category === category && isSameMonth(d, lastMonth)
  })

  const sumAmounts = (txs: Transaction[]) =>
    txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  const categorySpendThis = sumAmounts(categoryThisMonth)
  const categorySpendLast = sumAmounts(categoryLastMonth)

  let categoryTrend = ""
  if (categorySpendLast > 0) {
    const pct = Math.round(((categorySpendThis - categorySpendLast) / categorySpendLast) * 100)
    if (pct > 5) categoryTrend = ` ${category} kategorisinde bu ay harcamaların geçen aya göre %${pct} arttı.`
    else if (pct < -5) categoryTrend = ` ${category} kategorisinde bu ay harcamaların geçen aya göre %${Math.abs(pct)} azaldı.`
  }

  if (merchantCount >= 3) {
    return `Bu ay ${merchant} markasından ${merchantCount}. alışverişin.${categoryTrend}`
  }

  if (merchantCount === 2) {
    return `${merchant} markasından bu ay 2. kez harcama yaptın.${categoryTrend}`
  }

  const daysSince = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSince <= 1) {
    return `Bu ${category.toLowerCase()} harcaması son 24 saatin içinde.${categoryTrend || ` ${merchant} için ilk kaydın bu ay.`}`
  }

  const sameCategoryRecent = allTransactions.filter(
    (tx) =>
      tx.category === category &&
      tx.id !== transaction.id &&
      new Date(tx.date) >= startOfMonth(now)
  ).length

  if (sameCategoryRecent >= 2) {
    return `Bu ay ${category} kategorisinde ${sameCategoryRecent + 1}. harcaman.${categoryTrend}`
  }

  return `${merchant} işlemi kaydedildi.${categoryTrend || ` ${category} kategorisinde bu ay toplam ${formatTryShort(categorySpendThis)} harcadın.`}`
}

function formatTryShort(amount: number): string {
  return `${Math.abs(amount).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺`
}
