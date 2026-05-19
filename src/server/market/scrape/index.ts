import type { MarketPackage, ScrapeSourceResult } from "../types"
import { scrapeStreamingAndProductivity } from "./streaming"
import { scrapeTamindirOperators } from "./tamindir-operators"
import { scrapeTurkcellPackages } from "./turkcell"

export async function runMarketScrapers(): Promise<{
  packages: MarketPackage[]
  sources: ScrapeSourceResult[]
}> {
  const [turkcell, tamindir, streaming] = await Promise.all([
    scrapeTurkcellPackages(),
    scrapeTamindirOperators(),
    scrapeStreamingAndProductivity(),
  ])

  return {
    packages: [
      ...turkcell.packages,
      ...tamindir.packages,
      ...streaming.packages,
    ],
    sources: [turkcell.source, ...tamindir.sources, ...streaming.sources],
  }
}
