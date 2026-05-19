import { NextResponse } from "next/server"
import { mergeAllInsightsLive } from "@/lib/subscription-deals-server"
import { listTransactions } from "@/server/transactions/repository"
import { searchMemory } from "@/server/cognimemo/client"
import { isCognimemoConfigured } from "@/server/config/env"
import type { Insight } from "@/lib/types"

function memoryHitsToInsights(hits: { text?: string; content?: string }[]): Insight[] {
  return hits
    .map((h, i) => (h.text ?? h.content ?? "").trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((text, i) => ({
      id: `mem_${i}_${Date.now()}`,
      type: "memory" as const,
      title: "Hafıza",
      text,
      icon: "brain",
      severity: "info" as const,
      action: { label: "Sohbette sor", tab: "insights" as const },
    }))
}

export async function GET() {
  try {
    const transactions = await listTransactions()
    const { insights: merged, market, packages } = await mergeAllInsightsLive(transactions)
    let insights = merged

    if (isCognimemoConfigured()) {
      const search = await searchMemory({
        query: "subscription bill increase spending pattern unused",
        limit: 5,
      })
      if (search.ok && search.hits.length > 0) {
        const memoryInsights = memoryHitsToInsights(search.hits)
        const existingIds = new Set(insights.map((i) => i.id))
        for (const mi of memoryInsights) {
          if (!existingIds.has(mi.id)) insights = [mi, ...insights]
        }
      }
    }

    return NextResponse.json({ insights, market, packages })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown_error" },
      { status: 500 },
    )
  }
}
