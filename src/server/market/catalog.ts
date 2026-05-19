import { env } from "@/server/config/env"
import { FALLBACK_MARKET_PACKAGES } from "./fallback-catalog"
import { clearMarketCache, readMarketCache, writeMarketCache } from "./cache"
import { runMarketScrapers } from "./scrape"
import { mergeWithFallback } from "./scrape/utils"
import type { MarketCatalog, MarketPackage } from "./types"

export async function fetchMarketCatalog(options?: {
  force?: boolean
}): Promise<MarketCatalog> {
  if (!options?.force) {
    const hit = readMarketCache(env.marketCacheTtlMs)
    if (hit) return hit
  } else {
    clearMarketCache()
  }

  const fetchedAt = new Date().toISOString()
  let scraped: MarketPackage[] = []
  let sources = [] as MarketCatalog["meta"]["sources"]

  if (env.marketScrapeEnabled) {
    const result = await runMarketScrapers()
    scraped = result.packages
    sources = result.sources
  }

  const packages = mergeWithFallback(scraped, FALLBACK_MARKET_PACKAGES)
  const scrapedCount = packages.filter((p) => p.source === "scrape").length
  const fallbackCount = packages.length - scrapedCount

  const catalog: MarketCatalog = {
    packages,
    meta: {
      fetchedAt,
      fromCache: false,
      scrapeEnabled: env.marketScrapeEnabled,
      packageCount: packages.length,
      scrapedCount,
      fallbackCount,
      sources,
    },
  }

  writeMarketCache(catalog)
  return catalog
}

export async function getMarketPackages(force?: boolean): Promise<MarketPackage[]> {
  const { packages } = await fetchMarketCatalog({ force })
  return packages
}
