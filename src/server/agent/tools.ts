import { tool } from "ai"
import { z } from "zod"
import { searchMemory } from "@/server/cognimemo/client"
import { listTransactions, getTransactionById } from "@/server/transactions/repository"
import { buildSpendingSummary } from "./spending-summary"
import { mockInsights } from "@/lib/data"
import { mergeAllInsightsLive } from "@/lib/subscription-deals-server"
import { fetchMarketCatalog } from "@/server/market/catalog"
import { generateTransactionAnalysis } from "@/lib/cognimemo-analysis"

export function createFelloTools() {
  return {
    search_memory: tool({
      description:
        "CogniMemo uzun vadeli hafızada geçmiş harcama, alışkanlık ve örüntü araması yapar.",
      inputSchema: z.object({
        query: z.string().describe("Doğal dil arama sorgusu"),
        limit: z.number().int().min(1).max(20).optional(),
      }),
      execute: async ({ query, limit }) => {
        const result = await searchMemory({ query, limit: limit ?? 8 })
        return {
          ok: result.ok,
          error: result.error,
          hits: result.hits.map((h) => ({
            text: h.text ?? h.content ?? "",
            score: h.score,
            metadata: h.metadata,
          })),
        }
      },
    }),

    get_transactions: tool({
      description: "Kullanıcının harcama işlemlerini listeler; isteğe bağlı kategori veya merchant filtresi.",
      inputSchema: z.object({
        category: z.string().optional(),
        merchant: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
      execute: async ({ category, merchant, limit }) => {
        let txs = await listTransactions()
        if (category) {
          const c = category.toLowerCase()
          txs = txs.filter((t) => t.category.toLowerCase().includes(c))
        }
        if (merchant) {
          const m = merchant.toLowerCase()
          txs = txs.filter((t) => t.merchant.toLowerCase().includes(m))
        }
        const slice = txs.slice(0, limit ?? 15)
        return {
          count: slice.length,
          transactions: slice.map((t) => ({
            id: t.id,
            merchant: t.merchant,
            category: t.category,
            amount: t.amount,
            date: t.date,
            source: t.source,
          })),
        }
      },
    }),

    spending_summary: tool({
      description: "Bugün, bu hafta, bu ay veya geçen ay için harcama özeti.",
      inputSchema: z.object({
        period: z.enum(["today", "week", "month", "last_month"]),
      }),
      execute: async ({ period }) => {
        const txs = await listTransactions()
        return { summary: buildSpendingSummary(txs, period) }
      },
    }),

    get_insights: tool({
      description:
        "Fatura artışı, web scraping ile güncellenen abonelik fırsatları ve statik içgörüleri birleştirir.",
      inputSchema: z.object({}),
      execute: async () => {
        const txs = await listTransactions()
        const { insights, market } = await mergeAllInsightsLive(txs)
        return {
          count: insights.length,
          marketScraped: market.scrapedCount,
          marketFetchedAt: market.fetchedAt,
          insights: insights.slice(0, 8).map((i) => ({
            id: i.id,
            type: i.type,
            title: i.title,
            text: i.text,
            severity: i.severity,
            hasBillCreep: Boolean(i.billCreep),
            hasSubscriptionDeal: Boolean(i.subscriptionDeal),
          })),
        }
      },
    }),

    refresh_market_prices: tool({
      description:
        "Operatör ve abonelik sitelerinden güncel tarife fiyatlarını web scraping ile çeker ve önbelleği yeniler.",
      inputSchema: z.object({}),
      execute: async () => {
        const catalog = await fetchMarketCatalog({ force: true })
        return {
          packageCount: catalog.meta.packageCount,
          scrapedCount: catalog.meta.scrapedCount,
          fallbackCount: catalog.meta.fallbackCount,
          fetchedAt: catalog.meta.fetchedAt,
          sources: catalog.meta.sources,
        }
      },
    }),

    get_receipt_analysis: tool({
      description: "Tek bir işlem için CogniMemo tarzı kısa analiz ve bağlam.",
      inputSchema: z.object({
        transactionId: z.string(),
      }),
      execute: async ({ transactionId }) => {
        const tx = await getTransactionById(transactionId)
        if (!tx) return { error: "transaction_not_found" }
        const all = await listTransactions()
        const analysis = generateTransactionAnalysis(tx, all)
        const memory = await searchMemory({
          query: `${tx.merchant} ${tx.category}`,
          limit: 5,
        })
        return {
          transaction: {
            id: tx.id,
            merchant: tx.merchant,
            amount: tx.amount,
            date: tx.date,
          },
          analysis,
          memoryHits: memory.ok
            ? memory.hits.map((h) => h.text ?? h.content ?? "").filter(Boolean)
            : [],
        }
      },
    }),
  }
}
