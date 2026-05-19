import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai"
import { openai } from "@ai-sdk/openai"
import { env, isOpenaiConfigured } from "@/server/config/env"
import { buildSystemPrompt } from "./system-prompt"
import { createFelloTools } from "./tools"
import { generateDemoReply } from "@/lib/memory-chat"
import { listTransactions } from "@/server/transactions/repository"

export type AgentChatInput = {
  messages: UIMessage[]
}

export async function runFelloAgentStream(input: AgentChatInput) {
  const tools = createFelloTools()

  if (!isOpenaiConfigured()) {
    throw new Error("openai_not_configured")
  }

  return streamText({
    model: openai(env.openaiModel),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(input.messages),
    tools,
    stopWhen: stepCountIs(5),
  })
}

/** Plain-text fallback when OpenAI unavailable or errors */
export async function runFelloAgentFallback(lastUserText: string): Promise<string> {
  const transactions = await listTransactions()
  return generateDemoReply(lastUserText, transactions)
}

export function extractLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== "user") continue
    const text = m.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
    if (text?.trim()) return text.trim()
    // legacy shape
    const legacy = (m as { content?: string }).content
    if (legacy?.trim()) return legacy.trim()
  }
  return ""
}
