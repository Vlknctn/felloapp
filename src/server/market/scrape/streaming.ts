import type { MarketPackage, ScrapeSourceResult } from "../types"
import { fetchHtml } from "./http"
import { parsePriceTry, slugId } from "./utils"

const SOURCES = [
  {
    id: "spotify_tr",
    label: "Spotify TR",
    url: "https://www.spotify.com/tr-tr/premium/",
    provider: "Spotify",
    planName: "Premium Bireysel",
    tierId: "music_individual",
    category: "streaming" as const,
    features: ["Reklamsız müzik", "Çevrimdışı indirme", "Yüksek kalite"],
  },
  {
    id: "openai_pricing",
    label: "OpenAI Pricing",
    url: "https://openai.com/tr-TR/chatgpt/pricing/",
    provider: "OpenAI",
    planName: "ChatGPT Plus",
    tierId: "ai_assistant_plus",
    category: "productivity" as const,
    features: ["GPT-4o erişimi", "Öncelikli yanıt", "Dosya yükleme"],
  },
]

function findPriceInHtml(html: string): number | null {
  const tryPrices = [...html.matchAll(/(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*(?:₺|TL)/gi)]
    .map((m) => parsePriceTry(m[0]))
    .filter((n): n is number => n != null && n >= 10 && n <= 5000)

  if (tryPrices.length === 0) return null
  return tryPrices.sort((a, b) => a - b)[0] ?? null
}

export async function scrapeStreamingAndProductivity(): Promise<{
  packages: MarketPackage[]
  sources: ScrapeSourceResult[]
}> {
  const scrapedAt = new Date().toISOString()
  const packages: MarketPackage[] = []
  const sources: ScrapeSourceResult[] = []

  for (const src of SOURCES) {
    const started = Date.now()
    try {
      const html = await fetchHtml(src.url)
      const price = findPriceInHtml(html)
      if (!price) throw new Error("price_not_found")

      packages.push({
        id: slugId(src.provider, src.planName),
        provider: src.provider,
        planName: src.planName,
        monthlyPriceTry: price,
        category: src.category,
        tierId: src.tierId,
        features: src.features,
        source: "scrape",
        sourceUrl: src.url,
        scrapedAt,
      })

      sources.push({
        id: src.id,
        label: src.label,
        url: src.url,
        ok: true,
        count: 1,
        durationMs: Date.now() - started,
      })
    } catch (err) {
      sources.push({
        id: src.id,
        label: src.label,
        url: src.url,
        ok: false,
        count: 0,
        error: err instanceof Error ? err.message : "scrape_failed",
        durationMs: Date.now() - started,
      })
    }
  }

  return { packages, sources }
}
