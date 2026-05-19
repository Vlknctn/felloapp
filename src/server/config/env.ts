function envBool(key: string, defaultValue: boolean): boolean {
  const v = process.env[key]
  if (v === undefined) return defaultValue
  return v === "true" || v === "1"
}

export const env = {
  felloUserId: process.env.FELLO_USER_ID ?? "demo-ahmet",
  demoMode: envBool("DEMO_MODE", true),
  agentFallback: envBool("AGENT_FALLBACK", true),

  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",

  cognimemoApiUrl: process.env.COGNIMEMO_API_URL ?? "",
  cognimemoApiKey: process.env.COGNIMEMO_API_KEY ?? "",
  cognimemoIngestPath: process.env.COGNIMEMO_INGEST_PATH ?? "/memory/ingest",
  cognimemoSearchPath: process.env.COGNIMEMO_SEARCH_PATH ?? "/memory/search",

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",

  marketScrapeEnabled: envBool("MARKET_SCRAPE_ENABLED", true),
  marketCacheTtlMs: Number(process.env.MARKET_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000),
} as const

export function isCognimemoConfigured(): boolean {
  return Boolean(env.cognimemoApiUrl && env.cognimemoApiKey)
}

export function isOpenaiConfigured(): boolean {
  return Boolean(env.openaiApiKey)
}

/** Vercel serverless cannot open bundled SQLite at runtime — use mock data in demo. */
export function useInMemoryDemoStore(): boolean {
  return env.demoMode && Boolean(process.env.VERCEL)
}
