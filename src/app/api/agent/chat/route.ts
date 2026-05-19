import { NextResponse } from "next/server"
import { z } from "zod"
import type { UIMessage } from "ai"
import {
  runFelloAgentStream,
  runFelloAgentFallback,
  extractLastUserText,
} from "@/server/agent/fello-agent"
import { env, isOpenaiConfigured } from "@/server/config/env"

const bodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  sessionId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.parse(await req.json())
    const messages = parsed.messages as UIMessage[]
    const lastUser = extractLastUserText(messages)

    if (!lastUser) {
      return NextResponse.json({ error: "no_user_message" }, { status: 400 })
    }

    if (!isOpenaiConfigured()) {
      if (!env.agentFallback) {
        return NextResponse.json({ error: "openai_not_configured" }, { status: 503 })
      }
      const text = await runFelloAgentFallback(lastUser)
      return NextResponse.json({
        mode: "fallback",
        text,
      })
    }

    try {
      const result = await runFelloAgentStream({ messages })
      return result.toUIMessageStreamResponse()
    } catch (agentErr) {
      if (!env.agentFallback) {
        throw agentErr
      }
      const text = await runFelloAgentFallback(lastUser)
      return NextResponse.json({
        mode: "fallback",
        text,
        error: agentErr instanceof Error ? agentErr.message : "agent_error",
      })
    }
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
