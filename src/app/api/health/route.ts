import { NextResponse } from "next/server"
import { prisma } from "@/server/db/prisma"
import { pingCognimemo } from "@/server/cognimemo/client"
import { env, isCognimemoConfigured, isOpenaiConfigured, useInMemoryDemoStore } from "@/server/config/env"
import { mockTransactions } from "@/lib/data"
import { readMarketCache } from "@/server/market/cache"
import { countTransactions } from "@/server/transactions/repository"

export async function GET() {
  let database: { ok: boolean; transactionCount?: number; error?: string } = {
    ok: false,
  }

  if (useInMemoryDemoStore()) {
    database = { ok: true, transactionCount: mockTransactions.length }
  } else {
    try {
      const transactionCount = await countTransactions()
      database = { ok: true, transactionCount }
    } catch (err) {
      database = {
        ok: false,
        error: err instanceof Error ? err.message : "database_error",
      }
    }
  }

  let cognimemo: { ok: boolean; configured: boolean; error?: string } = {
    ok: false,
    configured: isCognimemoConfigured(),
  }

  if (isCognimemoConfigured()) {
    const ping = await pingCognimemo()
    cognimemo = { ok: ping.ok, configured: true, error: ping.error }
  }

  const openai = {
    configured: isOpenaiConfigured(),
  }

  const cachedMarket = readMarketCache(env.marketCacheTtlMs)
  const market = {
    scrapeEnabled: env.marketScrapeEnabled,
    cached: Boolean(cachedMarket),
    packageCount: cachedMarket?.meta.packageCount,
    scrapedCount: cachedMarket?.meta.scrapedCount,
    fetchedAt: cachedMarket?.meta.fetchedAt,
  }

  const ok = database.ok && (!cognimemo.configured || cognimemo.ok)

  return NextResponse.json({
    ok,
    service: "fello-api",
    timestamp: new Date().toISOString(),
    database,
    cognimemo,
    openai,
    market,
  })
}
