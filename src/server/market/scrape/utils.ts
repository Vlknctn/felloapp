import type { MarketPackage, PackageCategory } from "../types"

export function parsePriceTry(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/&nbsp;/g, "")
  const m = cleaned.match(/(\d{1,2}(?:\.\d{3})+|\d{2,4}(?:,\d{2})?)\s*(?:TL|₺)/i)
  if (!m) return null

  let token = m[1]
  let n: number

  if (/^\d{1,2}(\.\d{3})+$/.test(token)) {
    n = parseInt(token.replace(/\./g, ""), 10)
  } else if (token.includes(",")) {
    n = parseFloat(token.replace(/\./g, "").replace(",", "."))
  } else {
    n = parseFloat(token)
  }

  return Number.isFinite(n) && n >= 10 ? n : null
}

export function parseInternetGb(text: string): number | null {
  const fromName = text.match(/(?:star\+?|red|selfy|yıldız|yildiz|fırsat|firsat|gnç|gnc)\s*(\d{1,3})\b/i)
  if (fromName) {
    const gb = parseInt(fromName[1], 10)
    if (gb >= 1 && gb <= 500) return gb
  }

  const matches = [...text.matchAll(/(\d{1,4})\s*GB/gi)].map((m) => parseInt(m[1], 10))
  const valid = matches.filter((gb) => gb >= 1 && gb <= 500)
  if (valid.length === 0) return null

  return Math.max(...valid)
}

export function mobileTierId(gb: number): string {
  return `tr_mobile_${gb}gb`
}

export function slugId(provider: string, planName: string): string {
  return `${provider}_${planName}`
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80)
}

export function defaultMobileFeatures(gb: number): string[] {
  return [
    `${gb} GB internet`,
    "Sınırsız konuşma",
    "1000 SMS",
    "Yurt içi roaming",
  ]
}

export function buildMobilePackage(input: {
  provider: string
  planName: string
  monthlyPriceTry: number
  gb: number
  features?: string[]
  sourceUrl: string
  scrapedAt: string
}): MarketPackage {
  return {
    id: slugId(input.provider, input.planName),
    provider: input.provider,
    planName: input.planName,
    monthlyPriceTry: input.monthlyPriceTry,
    category: "mobile",
    tierId: mobileTierId(input.gb),
    features: input.features ?? defaultMobileFeatures(input.gb),
    source: "scrape",
    sourceUrl: input.sourceUrl,
    scrapedAt: input.scrapedAt,
  }
}

export function dedupePackages(packages: MarketPackage[]): MarketPackage[] {
  const map = new Map<string, MarketPackage>()
  for (const pkg of packages) {
    const key = `${pkg.provider}::${pkg.tierId}::${pkg.planName}`
    const prev = map.get(key)
    if (!prev || pkg.source === "scrape") {
      map.set(key, pkg)
    }
  }
  return [...map.values()]
}

export function mergeWithFallback(
  scraped: MarketPackage[],
  fallback: MarketPackage[],
): MarketPackage[] {
  const merged = dedupePackages(scraped)
  const hasProviderTier = new Set(merged.map((p) => `${p.provider}::${p.tierId}`))
  const hasProvider = new Set(merged.map((p) => p.provider))

  for (const fb of fallback) {
    if (fb.category === "mobile") {
      const key = `${fb.provider}::${fb.tierId}`
      if (hasProviderTier.has(key) || hasProvider.has(fb.provider)) continue
    } else {
      const exists = merged.some(
        (p) => p.category === fb.category && p.tierId === fb.tierId && p.provider === fb.provider,
      )
      if (exists) continue
    }
    merged.push({ ...fb })
  }

  return merged.sort((a, b) => a.monthlyPriceTry - b.monthlyPriceTry)
}

export function categoryLabel(category: PackageCategory): string {
  if (category === "mobile") return "mobil"
  if (category === "streaming") return "streaming"
  return "ürünivite"
}
