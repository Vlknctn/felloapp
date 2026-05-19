import { mergeInsightsWithBillCreep } from "./bill-creep-analysis"
import { mockSubscriptions } from "./data"
import {
  FALLBACK_MARKET_PACKAGES,
  type MarketPackage,
} from "./market-packages"
import { getProviderLogo } from "./provider-logos"
import type { Insight, SubscriptionDealDetail, Transaction } from "./types"

const MERCHANT_TO_PROVIDER: Record<string, string> = {
  Turkcell: "Turkcell",
  "Türk Telekom": "Türk Telekom",
  Vodafone: "Vodafone",
  Netflix: "Netflix",
  Spotify: "Spotify",
  "YouTube Premium": "YouTube",
  YouTube: "YouTube",
  "Google Gemini": "Google",
  ChatGPT: "OpenAI",
  OpenAI: "OpenAI",
}

function formatTry(amount: number): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`
}

function parseAmountTry(amountStr: string): number {
  const n = parseFloat(amountStr.replace(/[^\d,]/g, "").replace(",", "."))
  return Number.isFinite(n) ? n : 0
}

function intersectFeatures(a: string[], b: string[]): string[] {
  const setB = new Set(b)
  return a.filter((f) => setB.has(f))
}

function inferUserPackage(
  provider: string,
  monthlyPriceTry: number,
  catalog: MarketPackage[],
): MarketPackage | undefined {
  const byProvider = catalog.filter((p) => p.provider === provider)
  if (byProvider.length === 0) return undefined

  const exact = byProvider.find((p) => Math.abs(p.monthlyPriceTry - monthlyPriceTry) < 1)
  if (exact) return exact

  return byProvider.reduce((best, p) =>
    Math.abs(p.monthlyPriceTry - monthlyPriceTry) <
    Math.abs(best.monthlyPriceTry - monthlyPriceTry)
      ? p
      : best,
  )
}

function findBestAlternative(
  current: MarketPackage,
  catalog: MarketPackage[],
): MarketPackage | null {
  const peers = catalog.filter(
    (p) => p.tierId === current.tierId && p.id !== current.id,
  )
  const cheaper = peers
    .filter((p) => p.monthlyPriceTry < current.monthlyPriceTry)
    .sort((a, b) => a.monthlyPriceTry - b.monthlyPriceTry)

  return cheaper[0] ?? null
}

function toDealDetail(current: MarketPackage, recommended: MarketPackage): SubscriptionDealDetail {
  const matchedFeatures = intersectFeatures(current.features, recommended.features)
  const monthlySavingsTry =
    Math.round((current.monthlyPriceTry - recommended.monthlyPriceTry) * 100) / 100
  const yearlySavingsTry = Math.round(monthlySavingsTry * 12 * 100) / 100

  const liveNote =
    recommended.source === "scrape" || current.source === "scrape"
      ? " Güncel web fiyatlarına göre."
      : ""

  const summary = `${recommended.provider} ${recommended.planName}, ${current.provider} ${current.planName} ile aynı temel içeriği sunuyor; ayda ${formatTry(monthlySavingsTry)} (${formatTry(yearlySavingsTry)}/yıl) tasarruf edebilirsin.${liveNote}`

  return {
    category: current.category,
    current: {
      provider: current.provider,
      planName: current.planName,
      monthlyPriceTry: current.monthlyPriceTry,
      features: current.features,
      logoUrl: getProviderLogo(current.provider),
    },
    recommended: {
      provider: recommended.provider,
      planName: recommended.planName,
      monthlyPriceTry: recommended.monthlyPriceTry,
      features: recommended.features,
      logoUrl: getProviderLogo(recommended.provider),
    },
    monthlySavingsTry,
    yearlySavingsTry,
    matchedFeatures,
    summary,
  }
}

function collectUserPlans(transactions: Transaction[]): { provider: string; price: number }[] {
  const map = new Map<string, number>()

  for (const sub of mockSubscriptions) {
    const provider = MERCHANT_TO_PROVIDER[sub.name] ?? sub.name
    const price = parseAmountTry(sub.amount)
    if (price > 0) map.set(provider, price)
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  for (const tx of transactions) {
    if (tx.category !== "Abonelik" && tx.category !== "Fatura") continue
    if (new Date(tx.date) < monthStart) continue
    const provider = MERCHANT_TO_PROVIDER[tx.merchant] ?? tx.merchant
    const price = Math.abs(tx.amount)
    const prev = map.get(provider)
    if (prev == null || price > prev) map.set(provider, price)
  }

  return [...map.entries()].map(([provider, price]) => ({ provider, price }))
}

export function detectSubscriptionDeals(
  transactions: Transaction[],
  catalog: MarketPackage[] = FALLBACK_MARKET_PACKAGES,
): SubscriptionDealDetail[] {
  const deals: SubscriptionDealDetail[] = []
  const seen = new Set<string>()

  for (const { provider, price } of collectUserPlans(transactions)) {
    const current = inferUserPackage(provider, price, catalog)
    if (!current) continue

    const alternative = findBestAlternative(current, catalog)
    if (!alternative) continue

    const key = `${current.tierId}:${alternative.id}`
    if (seen.has(key)) continue
    seen.add(key)

    deals.push(toDealDetail(current, alternative))
  }

  return deals.sort((a, b) => b.monthlySavingsTry - a.monthlySavingsTry)
}

export function dealToInsight(deal: SubscriptionDealDetail, index: number): Insight {
  const { current, recommended, monthlySavingsTry } = deal

  return {
    id: `ins_sub_deal_${index}_${recommended.provider.toLowerCase().replace(/\s+/g, "_")}`,
    type: "tip",
    title: `${current.provider} yerine ${recommended.provider}`,
    text: `${current.planName} (${formatTry(current.monthlyPriceTry)}) yerine ${recommended.planName} (${formatTry(recommended.monthlyPriceTry)}) — aynı içerik, ayda ${formatTry(monthlySavingsTry)} daha ucuz.`,
    icon: "sparkles",
    severity: "positive",
    paymentAmountTry: monthlySavingsTry,
    action: { label: "Karşılaştırmayı gör", tab: "insights" },
    subscriptionDeal: deal,
  }
}

export function detectSubscriptionDealInsights(
  transactions: Transaction[],
  catalog: MarketPackage[] = FALLBACK_MARKET_PACKAGES,
): Insight[] {
  return detectSubscriptionDeals(transactions, catalog).map(dealToInsight)
}

export function mergeAllInsights(
  staticInsights: Insight[],
  transactions: Transaction[],
  catalog: MarketPackage[] = FALLBACK_MARKET_PACKAGES,
): Insight[] {
  const deals = detectSubscriptionDealInsights(transactions, catalog)
  const withBillCreep = mergeInsightsWithBillCreep(staticInsights, transactions)
  const dealProviders = new Set(
    deals.map((d) => d.subscriptionDeal?.current.provider).filter(Boolean),
  )

  const filtered = withBillCreep.filter((insight) => {
    if (!insight.title.includes("alternatif")) return true
    for (const p of dealProviders) {
      if (p && insight.title.includes(p)) return false
    }
    return true
  })

  return [...deals, ...filtered]
}

export function buildSubscriptionDealsReply(
  transactions: Transaction[],
  catalog: MarketPackage[] = FALLBACK_MARKET_PACKAGES,
): string {
  const deals = detectSubscriptionDeals(transactions, catalog)

  if (deals.length === 0) {
    return "Kayıtlı aboneliklerinde şu an daha ucuz ve eşdeğer bir paket önerisi yok. Yeni fatura veya e-posta geldiğinde tekrar kontrol ederim."
  }

  const lines = deals.slice(0, 3).map((d) => {
    const match =
      d.matchedFeatures.length > 0
        ? ` Ortak içerik: ${d.matchedFeatures.slice(0, 3).join(", ")}.`
        : ""
    return `• ${d.current.provider} ${d.current.planName} (${formatTry(d.current.monthlyPriceTry)}) → ${d.recommended.provider} ${d.recommended.planName} (${formatTry(d.recommended.monthlyPriceTry)}): ayda ${formatTry(d.monthlySavingsTry)} tasarruf.${match}`
  })

  const live =
    catalog.some((p) => p.source === "scrape")
      ? "\n\nFiyatlar web scraping ile güncellendi."
      : ""

  return `Abonelik karşılaştırması:\n${lines.join("\n")}\n\nFello AI → Abonelikler sekmesinden detaylı karşılaştırmayı açabilirsin.${live}`
}
