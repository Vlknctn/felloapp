"use client"

import * as React from "react"
import type { ChatMessage } from "@/lib/memory-chat"

type AgentChatResponse =
  | { mode: "fallback"; text: string }
  | { error: string }

function uiMessagesFromChat(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.role === "user" || (m.role === "assistant" && m.variant !== "welcome"))
    .map((m) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text" as const, text: m.text }],
    }))
}

function parseStreamChunk(line: string): string {
  if (!line.startsWith("data: ")) return ""
  const payload = line.slice(6).trim()
  if (payload === "[DONE]") return ""
  try {
    const json = JSON.parse(payload) as {
      type?: string
      delta?: string
      textDelta?: string
    }
    if (json.type === "text-delta" && typeof json.delta === "string") return json.delta
    if (typeof json.textDelta === "string") return json.textDelta
  } catch {
    return ""
  }
  return ""
}

export function useAgentChatSubmit() {
  const abortRef = React.useRef<AbortController | null>(null)

  const cancel = React.useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const submit = React.useCallback(
    async (
      userText: string,
      priorMessages: ChatMessage[],
      onAssistantDelta: (text: string) => void,
      onDone: (finalText: string) => void,
      onError: (message: string) => void,
    ) => {
      cancel()
      const controller = new AbortController()
      abortRef.current = controller

      const history = [
        ...priorMessages.filter((m) => m.role === "user" || m.role === "assistant"),
        { id: `u-pending`, role: "user" as const, text: userText },
      ]

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: uiMessagesFromChat(history) }),
          signal: controller.signal,
        })

        const contentType = res.headers.get("content-type") ?? ""

        if (contentType.includes("application/json")) {
          const data = (await res.json()) as AgentChatResponse & { text?: string }
          if (!res.ok) {
            onError("error" in data ? String(data.error) : "agent_failed")
            return
          }
          const text =
            "text" in data && data.text
              ? data.text
              : "mode" in data && data.mode === "fallback"
                ? data.text
                : ""
          onAssistantDelta(text)
          onDone(text)
          return
        }

        if (!res.ok || !res.body) {
          onError("stream_failed")
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let accumulated = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            const delta = parseStreamChunk(line)
            if (!delta) continue
            accumulated += delta
            onAssistantDelta(accumulated)
          }
        }

        onDone(accumulated.trim() || "Yanıt oluşturulamadı.")
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        onError(err instanceof Error ? err.message : "network_error")
      } finally {
        abortRef.current = null
      }
    },
    [cancel],
  )

  React.useEffect(() => () => cancel(), [cancel])

  return { submit, cancel }
}
