import { NextResponse } from "next/server"
import { z } from "zod"
import { createTransaction, listTransactions } from "@/server/transactions/repository"
import { ingestTransactionMemory } from "@/server/cognimemo/client"
import { isCognimemoConfigured } from "@/server/config/env"

const createSchema = z.object({
  merchant: z.string().min(1),
  category: z.string().min(1),
  amount: z.number(),
  source: z.enum(["gmail", "manual", "bank"]).optional(),
  logoUrl: z.string().optional(),
  note: z.string().optional(),
})

export async function GET() {
  try {
    const transactions = await listTransactions()
    return NextResponse.json({ transactions })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown_error" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = createSchema.parse(await req.json())
    const tx = await createTransaction({
      merchant: body.merchant,
      category: body.category,
      amount: body.amount,
      source: body.source,
      logoUrl: body.logoUrl,
    })

    if (isCognimemoConfigured()) {
      void ingestTransactionMemory(tx).catch(() => undefined)
    }

    return NextResponse.json({ transaction: tx }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_body", details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown_error" },
      { status: 500 },
    )
  }
}
