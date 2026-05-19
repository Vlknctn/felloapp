import type { MarketPackage } from "../types"
import type { ScrapeSourceResult } from "../types"
import { fetchHtml } from "./http"
import { buildMobilePackage, parseInternetGb } from "./utils"

const SOURCE_URL = "https://www.turkcell.com.tr/paket-ve-tarifeler/ana-paketler"

type TurkcellBenefit = {
  name?: string
  value?: string
  unitValue?: string
  type?: string
}

type TurkcellPackage = {
  id?: string
  title?: string
  price?: { amount?: string; amountDouble?: number; priceUnit?: string; priceTimeUnit?: string }
  benefits?: TurkcellBenefit[]
}

function benefitsToFeatures(benefits: TurkcellBenefit[] | undefined): string[] {
  if (!benefits?.length) return []
  return benefits
    .slice(0, 6)
    .map((b) => {
      const val = b.value?.trim()
      const unit = b.unitValue?.trim()
      const name = b.name?.trim()
      if (name && val && unit) return `${val} ${unit} ${name}`
      if (name) return name
      return ""
    })
    .filter(Boolean)
}

function extractPackagesFromNextData(html: string): TurkcellPackage[] {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) throw new Error("next_data_missing")

  const data = JSON.parse(m[1]) as {
    props?: {
      pageProps?: {
        dehydratedState?: { queries?: { state?: { data?: { packages?: TurkcellPackage[] } } }[] }
      }
    }
  }

  const queries = data.props?.pageProps?.dehydratedState?.queries ?? []
  for (const q of queries) {
    const packages = q.state?.data?.packages
    if (Array.isArray(packages) && packages.length > 0) return packages
  }

  throw new Error("packages_not_found")
}

export async function scrapeTurkcellPackages(): Promise<{
  packages: MarketPackage[]
  source: ScrapeSourceResult
}> {
  const started = Date.now()
  const scrapedAt = new Date().toISOString()

  try {
    const html = await fetchHtml(SOURCE_URL)
    const raw = extractPackagesFromNextData(html)
    const packages: MarketPackage[] = []

    for (const item of raw) {
      const title = item.title?.trim()
      const price =
        item.price?.amountDouble ??
        (item.price?.amount ? parseFloat(item.price.amount) : NaN)
      if (!title || !Number.isFinite(price) || price <= 0) continue

      const benefitText = (item.benefits ?? [])
        .map((b) => `${b.value ?? ""} ${b.unitValue ?? ""} ${b.type ?? ""}`)
        .join(" ")
      const gb = parseInternetGb(`${title} ${benefitText}`)
      if (!gb) continue

      packages.push(
        buildMobilePackage({
          provider: "Turkcell",
          planName: title,
          monthlyPriceTry: Math.round(price * 100) / 100,
          gb,
          features: benefitsToFeatures(item.benefits),
          sourceUrl: SOURCE_URL,
          scrapedAt,
        }),
      )
    }

    if (packages.length === 0) throw new Error("no_packages_parsed")

    return {
      packages,
      source: {
        id: "turkcell_official",
        label: "Turkcell (resmi site)",
        url: SOURCE_URL,
        ok: true,
        count: packages.length,
        durationMs: Date.now() - started,
      },
    }
  } catch (err) {
    return {
      packages: [],
      source: {
        id: "turkcell_official",
        label: "Turkcell (resmi site)",
        url: SOURCE_URL,
        ok: false,
        count: 0,
        error: err instanceof Error ? err.message : "scrape_failed",
        durationMs: Date.now() - started,
      },
    }
  }
}
