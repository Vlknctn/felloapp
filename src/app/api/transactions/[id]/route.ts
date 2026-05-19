import { NextResponse } from "next/server"
import { getTransactionById } from "@/server/transactions/repository"
import { generateTransactionAnalysis } from "@/lib/cognimemo-analysis"
import { listTransactions } from "@/server/transactions/repository"
import { searchMemory } from "@/server/cognimemo/client"
import { isCognimemoConfigured } from "@/server/config/env"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const transaction = await getTransactionById(id)
    if (!transaction) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const all = await listTransactions()
    const analysis = generateTransactionAnalysis(transaction, all)

    let memorySnippets: string[] = []
    if (isCognimemoConfigured()) {
      const search = await searchMemory({
        query: `${transaction.merchant} ${transaction.category} harcama`,
        limit: 5,
      })
      if (search.ok) {
        memorySnippets = search.hits
          .map((h) => h.text ?? h.content ?? "")
          .filter(Boolean)
          .slice(0, 3)
      }
    }

    return NextResponse.json({ transaction, analysis, memorySnippets })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown_error" },
      { status: 500 },
    )
  }
}
