import type { MarketPackage, PackageCategory } from "@/lib/market-packages"

export type { MarketPackage, PackageCategory }

export type ScrapeSourceResult = {
  id: string
  label: string
  url: string
  ok: boolean
  count: number
  error?: string
  durationMs: number
}

export type MarketCatalogMeta = {
  fetchedAt: string
  fromCache: boolean
  scrapeEnabled: boolean
  packageCount: number
  scrapedCount: number
  fallbackCount: number
  sources: ScrapeSourceResult[]
}

export type MarketCatalog = {
  packages: MarketPackage[]
  meta: MarketCatalogMeta
}
