import { NextResponse } from "next/server"
import { fetchMarketCatalog } from "@/server/market/catalog"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("refresh") === "1"
    const catalog = await fetchMarketCatalog({ force })
    return NextResponse.json(catalog)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "market_catalog_failed" },
      { status: 500 },
    )
  }
}
