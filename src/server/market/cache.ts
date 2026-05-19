import type { MarketCatalog } from "./types"

let cached: MarketCatalog | null = null
let cachedAt = 0

export function readMarketCache(ttlMs: number): MarketCatalog | null {
  if (!cached) return null
  if (Date.now() - cachedAt > ttlMs) return null
  return {
    ...cached,
    meta: { ...cached.meta, fromCache: true },
  }
}

export function writeMarketCache(catalog: MarketCatalog): void {
  cached = catalog
  cachedAt = Date.now()
}

export function clearMarketCache(): void {
  cached = null
  cachedAt = 0
}
