import * as cheerio from "cheerio"
import type { MarketPackage, ScrapeSourceResult } from "../types"
import { fetchHtml } from "./http"
import { buildMobilePackage, parseInternetGb, parsePriceTry } from "./utils"

type OperatorScrapeConfig = {
  id: string
  label: string
  provider: string
  url: string
}

const OPERATORS: OperatorScrapeConfig[] = [
  {
    id: "turktelekom_tamindir",
    label: "Türk Telekom (Tamindir)",
    provider: "Türk Telekom",
    url: "https://www.tamindir.com/blog/turk-telekom-tarifeleri_79828/",
  },
  {
    id: "vodafone_tamindir",
    label: "Vodafone (Tamindir)",
    provider: "Vodafone",
    url: "https://www.tamindir.com/blog/vodafone-tarifeleri_79949/",
  },
]

function parseTamindirTable(html: string, config: OperatorScrapeConfig, scrapedAt: string) {
  const $ = cheerio.load(html)
  const packages: MarketPackage[] = []

  $("table tr").each((_, row) => {
    const cells = $(row)
      .find("th, td")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " ").trim())
      .filter(Boolean)

    if (cells.length < 2) return

    const planName = cells[0]
    const details = cells.slice(1).join(" ")
    const price = parsePriceTry(details)
    const gb = parseInternetGb(`${planName} ${details}`)

    if (!price || !gb) return
    if (/taahhütsüz|evde internet|fiber|superbox/i.test(`${planName} ${details}`)) return

    packages.push(
      buildMobilePackage({
        provider: config.provider,
        planName,
        monthlyPriceTry: price,
        gb,
        sourceUrl: config.url,
        scrapedAt,
      }),
    )
  })

  return packages
}

export async function scrapeTamindirOperator(
  config: OperatorScrapeConfig,
): Promise<{ packages: MarketPackage[]; source: ScrapeSourceResult }> {
  const started = Date.now()
  const scrapedAt = new Date().toISOString()

  try {
    const html = await fetchHtml(config.url)
    const packages = parseTamindirTable(html, config, scrapedAt)
    if (packages.length === 0) throw new Error("no_table_rows")

    return {
      packages,
      source: {
        id: config.id,
        label: config.label,
        url: config.url,
        ok: true,
        count: packages.length,
        durationMs: Date.now() - started,
      },
    }
  } catch (err) {
    return {
      packages: [],
      source: {
        id: config.id,
        label: config.label,
        url: config.url,
        ok: false,
        count: 0,
        error: err instanceof Error ? err.message : "scrape_failed",
        durationMs: Date.now() - started,
      },
    }
  }
}

export async function scrapeTamindirOperators(): Promise<{
  packages: MarketPackage[]
  sources: ScrapeSourceResult[]
}> {
  const results = await Promise.all(OPERATORS.map((op) => scrapeTamindirOperator(op)))
  return {
    packages: results.flatMap((r) => r.packages),
    sources: results.map((r) => r.source),
  }
}
