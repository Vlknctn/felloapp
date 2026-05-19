import type { Insight, BillCreepDetail, Transaction } from "./types"

const BILL_CATEGORIES = new Set(["Fatura", "Abonelik"])
const MIN_INCREASE_PCT = 8
const MIN_DELTA_TRY = 25

type ProviderMeta = {
  supportPhone: string
  supportLabel: string
}

const PROVIDER_META: Record<string, ProviderMeta> = {
  Turkcell: { supportPhone: "444 0 532", supportLabel: "Turkcell Müşteri Hizmetleri" },
  Vodafone: { supportPhone: "542", supportLabel: "Vodafone Müşteri Hizmetleri" },
  "Türk Telekom": { supportPhone: "444 1 444", supportLabel: "Türk Telekom Müşteri Hizmetleri" },
  Netflix: { supportPhone: "0850 390 7444", supportLabel: "Netflix Destek" },
  Spotify: { supportPhone: "—", supportLabel: "Spotify uygulama içi destek" },
}

function formatTry(amount: number): string {
  return `${Math.abs(amount).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`
}

function isInRange(date: Date, start: Date, end: Date) {
  const t = date.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

function sumMerchantInRange(transactions: Transaction[], merchant: string, start: Date, end: Date) {
  return transactions
    .filter(
      (tx) =>
        tx.merchant === merchant &&
        BILL_CATEGORIES.has(tx.category) &&
        isInRange(new Date(tx.date), start, end),
    )
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
}

function merchantsInBillCategories(transactions: Transaction[]) {
  const set = new Set<string>()
  for (const tx of transactions) {
    if (BILL_CATEGORIES.has(tx.category)) set.add(tx.merchant)
  }
  return [...set]
}

export function buildCallScript(detail: Omit<BillCreepDetail, "callScript" | "supportPhone" | "supportLabel">): string {
  const meta = PROVIDER_META[detail.merchant]
  const providerName = meta?.supportLabel ?? detail.merchant

  return [
    `Merhaba, ${detail.merchant} müşterisiyim.`,
    `Geçen ay ${providerName.includes("müşteri") ? "faturam" : "ödemem"} ${formatTry(detail.lastMonthAmount)} iken bu ay ${formatTry(detail.thisMonthAmount)} oldu; yaklaşık %${detail.percentChange} artış var (${formatTry(detail.absoluteDelta)} fark).`,
    "Paketimde veya kullanımımda bilerek bir değişiklik yapmadım.",
    "Faturadaki artışın nedenini (zam, aşım, ek paket vb.) öğrenmek istiyorum; gereksiz kalemler varsa düzeltmek veya uygun bir tarife önermenizi rica ediyorum.",
    "Teşekkürler.",
  ].join(" ")
}

function toBillCreepDetail(
  merchant: string,
  category: string,
  thisMonthAmount: number,
  lastMonthAmount: number,
): BillCreepDetail {
  const absoluteDelta = Math.round((thisMonthAmount - lastMonthAmount) * 100) / 100
  const percentChange = Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100)
  const meta = PROVIDER_META[merchant]

  const base = {
    merchant,
    category,
    thisMonthAmount,
    lastMonthAmount,
    percentChange,
    absoluteDelta,
  }

  return {
    ...base,
    callScript: buildCallScript(base),
    supportPhone: meta?.supportPhone,
    supportLabel: meta?.supportLabel,
  }
}

export function detectBillCreepInsights(transactions: Transaction[]): Insight[] {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  const results: Insight[] = []

  for (const merchant of merchantsInBillCategories(transactions)) {
    const thisAmount = sumMerchantInRange(transactions, merchant, thisMonthStart, now)
    const lastAmount = sumMerchantInRange(transactions, merchant, lastMonthStart, lastMonthEnd)

    if (lastAmount <= 0 || thisAmount <= lastAmount) continue

    const absoluteDelta = thisAmount - lastAmount
    const percentChange = Math.round((absoluteDelta / lastAmount) * 100)

    if (percentChange < MIN_INCREASE_PCT && absoluteDelta < MIN_DELTA_TRY) continue

    const category =
      transactions.find((tx) => tx.merchant === merchant && BILL_CATEGORIES.has(tx.category))?.category ??
      "Fatura"

    const billCreep = toBillCreepDetail(merchant, category, thisAmount, lastAmount)

    const categoryHint =
      category === "Fatura"
        ? "Aşım ücreti veya tarife zammı faturaya yansımış olabilir."
        : "Ücret artışı veya plan değişikliği yansımış olabilir."

    results.push({
      id: `ins_bill_creep_${merchant.toLowerCase().replace(/\s+/g, "_")}`,
      type: "memory",
      title: `${merchant} faturan arttı`,
      text: `Geçen aya göre %${percentChange} fazla (${formatTry(lastAmount)} → ${formatTry(thisAmount)}). ${categoryHint}`,
      icon: "brain",
      severity: "warning",
      paymentAmountTry: absoluteDelta,
      action: { label: "Görüşme metnini gör", tab: "insights" },
      billCreep,
    })
  }

  return results.sort((a, b) => (b.billCreep?.percentChange ?? 0) - (a.billCreep?.percentChange ?? 0))
}

export function mergeInsightsWithBillCreep(staticInsights: Insight[], transactions: Transaction[]): Insight[] {
  const dynamic = detectBillCreepInsights(transactions)
  const dynamicMerchants = new Set(dynamic.map((i) => i.billCreep?.merchant).filter(Boolean))

  const filteredStatic = staticInsights.filter((insight) => {
    if (insight.id === "ins_sub_001") return false
    if (insight.type === "memory" && insight.title.includes("faturan arttı")) {
      const merchant = dynamicMerchants.values().next().value
      if (merchant && insight.title.toLowerCase().includes(String(merchant).toLowerCase())) return false
    }
    return true
  })

  return [...dynamic, ...filteredStatic]
}
