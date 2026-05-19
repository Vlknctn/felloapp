import { fetchMarketCatalog } from "@/server/market/catalog"
import type { MarketCatalogMeta } from "@/server/market/types"
import type { Insight, Transaction } from "./types"
import {
  buildSubscriptionDealsReply,
  mergeAllInsights,
} from "./subscription-deals"
import { mockInsights } from "./data"

export async function mergeAllInsightsLive(
  transactions: Transaction[],
  options?: { forceScrape?: boolean },
): Promise<{
  insights: Insight[]
  market: MarketCatalogMeta
  packages: Awaited<ReturnType<typeof fetchMarketCatalog>>["packages"]
}> {
  const { packages, meta } = await fetchMarketCatalog({ force: options?.forceScrape })
  const insights = mergeAllInsights(mockInsights, transactions, packages)
  return { insights, market: meta, packages }
}

export async function buildSubscriptionDealsReplyLive(
  transactions: Transaction[],
  options?: { forceScrape?: boolean },
): Promise<string> {
  const { packages } = await fetchMarketCatalog({ force: options?.forceScrape })
  return buildSubscriptionDealsReply(transactions, packages)
}
