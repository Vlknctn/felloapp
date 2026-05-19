import { NextResponse } from "next/server"
import { z } from "zod"
import { searchMemory } from "@/server/cognimemo/client"

const bodySchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
})

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json())
    const result = await searchMemory(body)
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "search_failed", hits: [], raw: result.raw },
        { status: 502 },
      )
    }
    return NextResponse.json({ ok: true, hits: result.hits, raw: result.raw })
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
