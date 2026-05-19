import { env, isCognimemoConfigured } from "@/server/config/env"

export type MemorySearchHit = {
  text?: string
  content?: string
  score?: number
  metadata?: Record<string, unknown>
}

export type MemorySearchResult = {
  ok: boolean
  hits: MemorySearchHit[]
  raw?: unknown
  error?: string
}

export type MemoryIngestResult = {
  ok: boolean
  id?: string
  raw?: unknown
  error?: string
}

function baseUrl(): string {
  return env.cognimemoApiUrl.replace(/\/$/, "")
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.cognimemoApiKey}`,
    "X-Api-Key": env.cognimemoApiKey,
  }
}

function normalizeHits(data: unknown): MemorySearchHit[] {
  if (!data || typeof data !== "object") return []
  const obj = data as Record<string, unknown>

  const candidates =
    (Array.isArray(obj.results) && obj.results) ||
    (Array.isArray(obj.memories) && obj.memories) ||
    (Array.isArray(obj.data) && obj.data) ||
    (Array.isArray(obj.hits) && obj.hits) ||
    (Array.isArray(data) && data) ||
    []

  return candidates.map((item) => {
    if (typeof item === "string") return { text: item }
    if (item && typeof item === "object") {
      const row = item as Record<string, unknown>
      return {
        text: String(row.text ?? row.content ?? row.memory ?? ""),
        content: row.content ? String(row.content) : undefined,
        score: typeof row.score === "number" ? row.score : undefined,
        metadata:
          row.metadata && typeof row.metadata === "object"
            ? (row.metadata as Record<string, unknown>)
            : undefined,
      }
    }
    return { text: String(item) }
  })
}

export async function ingestMemory(input: {
  text: string
  metadata?: Record<string, unknown>
}): Promise<MemoryIngestResult> {
  if (!isCognimemoConfigured()) {
    return { ok: false, error: "CogniMemo not configured" }
  }

  try {
    const res = await fetch(`${baseUrl()}${env.cognimemoIngestPath}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ text: input.text, metadata: input.metadata }),
    })

    const raw = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        error: `CogniMemo ingest failed (${res.status})`,
        raw,
      }
    }

    const id =
      raw && typeof raw === "object" && "id" in raw ? String((raw as { id: unknown }).id) : undefined

    return { ok: true, id, raw }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "CogniMemo ingest error",
    }
  }
}

export async function searchMemory(input: {
  query: string
  limit?: number
}): Promise<MemorySearchResult> {
  if (!isCognimemoConfigured()) {
    return { ok: false, hits: [], error: "CogniMemo not configured" }
  }

  const limit = Math.min(100, Math.max(1, input.limit ?? 10))

  try {
    const res = await fetch(`${baseUrl()}${env.cognimemoSearchPath}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query: input.query, limit }),
    })

    const raw = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        hits: [],
        error: `CogniMemo search failed (${res.status})`,
        raw,
      }
    }

    return { ok: true, hits: normalizeHits(raw), raw }
  } catch (err) {
    return {
      ok: false,
      hits: [],
      error: err instanceof Error ? err.message : "CogniMemo search error",
    }
  }
}

export async function pingCognimemo(): Promise<{ ok: boolean; error?: string }> {
  if (!isCognimemoConfigured()) {
    return { ok: false, error: "not_configured" }
  }
  const result = await searchMemory({ query: "health", limit: 1 })
  return { ok: result.ok, error: result.error }
}

export async function ingestTransactionMemory(
  tx: import("@/lib/types").Transaction,
): Promise<MemoryIngestResult> {
  const { formatTransactionMemory } = await import("./format-memory")
  const { text, metadata } = formatTransactionMemory(tx)
  return ingestMemory({ text, metadata })
}
