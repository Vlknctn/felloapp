import { NextResponse } from "next/server"
import { z } from "zod"
import { ingestMemory } from "@/server/cognimemo/client"

const bodySchema = z.object({
  text: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json())
    const result = await ingestMemory(body)
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "ingest_failed", raw: result.raw }, { status: 502 })
    }
    return NextResponse.json({ ok: true, id: result.id, raw: result.raw })
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
