/** Client + server ortak pazar paketi tipi ve yedek katalog */
export type PackageCategory = "mobile" | "streaming" | "productivity"

export type MarketPackage = {
  id: string
  provider: string
  planName: string
  monthlyPriceTry: number
  category: PackageCategory
  tierId: string
  features: string[]
  source?: "scrape" | "fallback"
  sourceUrl?: string
  scrapedAt?: string
}

export const FALLBACK_MARKET_PACKAGES: MarketPackage[] = [
  {
    id: "turkcell_platinum",
    provider: "Turkcell",
    planName: "Platinum Prime",
    monthlyPriceTry: 425,
    category: "mobile",
    tierId: "tr_mobile_50gb",
    features: ["50 GB internet", "Sınırsız konuşma", "1000 SMS", "Yurt içi roaming"],
    source: "fallback",
  },
  {
    id: "tt_yildiz50",
    provider: "Türk Telekom",
    planName: "Yıldız 50",
    monthlyPriceTry: 329,
    category: "mobile",
    tierId: "tr_mobile_50gb",
    features: ["50 GB internet", "Sınırsız konuşma", "1000 SMS", "Yurt içi roaming"],
    source: "fallback",
  },
  {
    id: "vodafone_red50",
    provider: "Vodafone",
    planName: "Red 50",
    monthlyPriceTry: 349,
    category: "mobile",
    tierId: "tr_mobile_50gb",
    features: ["50 GB internet", "Sınırsız konuşma", "1000 SMS", "Yurt içi roaming"],
    source: "fallback",
  },
  {
    id: "netflix_standard",
    provider: "Netflix",
    planName: "Standart (1080p)",
    monthlyPriceTry: 114.99,
    category: "streaming",
    tierId: "stream_hd_2screen",
    features: ["1080p", "2 eş zamanlı ekran", "İndirme", "Reklamsız"],
    source: "fallback",
  },
  {
    id: "disney_bundle",
    provider: "Disney+",
    planName: "Standart",
    monthlyPriceTry: 64.99,
    category: "streaming",
    tierId: "stream_hd_2screen",
    features: ["1080p", "2 eş zamanlı ekran", "İndirme", "Reklamsız"],
    source: "fallback",
  },
  {
    id: "spotify_individual",
    provider: "Spotify",
    planName: "Bireysel",
    monthlyPriceTry: 59.99,
    category: "streaming",
    tierId: "music_individual",
    features: ["Reklamsız müzik", "Çevrimdışı indirme", "Yüksek kalite"],
    source: "fallback",
  },
  {
    id: "yt_music_premium",
    provider: "YouTube",
    planName: "Music Premium",
    monthlyPriceTry: 39.99,
    category: "streaming",
    tierId: "music_individual",
    features: ["Reklamsız müzik", "Çevrimdışı indirme", "Yüksek kalite"],
    source: "fallback",
  },
  {
    id: "chatgpt_plus",
    provider: "OpenAI",
    planName: "ChatGPT Plus",
    monthlyPriceTry: 649,
    category: "productivity",
    tierId: "ai_assistant_plus",
    features: ["GPT-4o erişimi", "Öncelikli yanıt", "Dosya yükleme", "Görsel üretim"],
    source: "fallback",
  },
  {
    id: "gemini_advanced",
    provider: "Google",
    planName: "Gemini Advanced",
    monthlyPriceTry: 499,
    category: "productivity",
    tierId: "ai_assistant_plus",
    features: ["Gemini 1.5 Pro", "Öncelikli yanıt", "Dosya yükleme", "Görsel üretim"],
    source: "fallback",
  },
]
