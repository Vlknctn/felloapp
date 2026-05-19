import { User, Transaction, Insight } from "./types";

export const mockUser: User = {
  name: "Ahmet",
  avatar: "/" + encodeURIComponent("profile photo.png"),
  thisMonthSpend: 8420,
  lastMonthSpend: 7100,
  delta: +18.6,
};

export const mockTransactions: Transaction[] = [
  // ── Bugün ──
  {
    id: "txn_001",
    merchant: "Getir",
    category: "Market",
    amount: -149,
    currency: "TRY",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 saat önce
    source: "gmail",
    logoUrl: "/" + encodeURIComponent("getir logo .png"),
  },
  {
    id: "txn_002",
    merchant: "Starbucks",
    category: "Kahve",
    amount: -125,
    currency: "TRY",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 saat önce
    source: "bank",
    logoUrl: "/Starbucks_Corporation_Logo_2011.svg.png",
  },
  {
    id: "txn_003",
    merchant: "Uber",
    category: "Ulaşım",
    amount: -87,
    currency: "TRY",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: "bank",
    logoUrl: "/1659761297uber-icon.png",
  },

  // ── Dün ──
  {
    id: "txn_004",
    merchant: "Spotify",
    category: "Abonelik",
    amount: -59.99,
    currency: "TRY",
    date: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/Spotify_logo_without_text.svg.png",
  },
  {
    id: "txn_005",
    merchant: "Migros",
    category: "Market",
    amount: -312,
    currency: "TRY",
    date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    source: "bank",
    logoUrl: "/M.png",
  },
  {
    id: "txn_006",
    merchant: "Bolt",
    category: "Ulaşım",
    amount: -64,
    currency: "TRY",
    date: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    source: "manual",
    logoUrl: "/Bolt_logo.png",
  },

  // ── 2 Gün Önce ──
  {
    id: "txn_007",
    merchant: "Domino's",
    category: "Yemek",
    amount: -189,
    currency: "TRY",
    date: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/" + encodeURIComponent("Domino's_pizza_logo.svg.png"),
  },
  {
    id: "txn_008",
    merchant: "Netflix",
    category: "Abonelik",
    amount: -89.99,
    currency: "TRY",
    date: new Date(Date.now() - 54 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/netflix.png",
  },
  {
    id: "txn_009",
    merchant: "Trendyol",
    category: "Market",
    amount: -455,
    currency: "TRY",
    date: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/" + encodeURIComponent("trendyol logo.png"),
  },
  {
    id: "txn_010",
    merchant: "Tchibo",
    category: "Kahve",
    amount: -78,
    currency: "TRY",
    date: new Date(Date.now() - 58 * 60 * 60 * 1000).toISOString(),
    source: "bank",
    logoUrl: "/Tchibo_logo.png",
  },

  // ── 4 Gün Önce ──
  {
    id: "txn_011",
    merchant: "Getir",
    category: "Market",
    amount: -213,
    currency: "TRY",
    date: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/" + encodeURIComponent("getir logo .png"),
  },
  {
    id: "txn_012",
    merchant: "IETT",
    category: "Ulaşım",
    amount: -200,
    currency: "TRY",
    date: new Date(Date.now() - 98 * 60 * 60 * 1000).toISOString(),
    source: "bank",
    logoUrl: "/IETT.PNG",
  },

  // ── 6 Gün Önce ──
  {
    id: "txn_013",
    merchant: "Apple Music",
    category: "Abonelik",
    amount: -49.99,
    currency: "TRY",
    date: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/Apple_Music_icon.svg.png",
  },
  {
    id: "txn_014",
    merchant: "Caribou Coffee",
    category: "Kahve",
    amount: -95,
    currency: "TRY",
    date: new Date(Date.now() - 146 * 60 * 60 * 1000).toISOString(),
    source: "bank",
    logoUrl: "/Caribou1.svg",
  },
  {
    id: "txn_015",
    merchant: "Uber Eats",
    category: "Yemek",
    amount: -245,
    currency: "TRY",
    date: new Date(Date.now() - 148 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/" + encodeURIComponent("uber eats.png"),
  },
  {
    id: "txn_016",
    merchant: "Turkcell",
    category: "Fatura",
    amount: -425,
    currency: "TRY",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/AMBLEM_SARI.jpg.webp",
  },
  // Geçen ay — bill creep karşılaştırması (~%20 artış)
  {
    id: "txn_017",
    merchant: "Turkcell",
    category: "Fatura",
    amount: -354,
    currency: "TRY",
    date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 18).toISOString(),
    source: "gmail",
    logoUrl: "/AMBLEM_SARI.jpg.webp",
  },

  // ── AI & iş abonelikleri ──
  {
    id: "txn_018",
    merchant: "ChatGPT",
    category: "Abonelik",
    amount: -699,
    currency: "TRY",
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/chatgpt.png",
  },
  {
    id: "txn_019",
    merchant: "Google Gemini",
    category: "Abonelik",
    amount: -649,
    currency: "TRY",
    date: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/gemini.jpeg",
  },
  {
    id: "txn_020",
    merchant: "LinkedIn",
    category: "Abonelik",
    amount: -899,
    currency: "TRY",
    date: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
    source: "gmail",
    logoUrl: "/linkedin.jpeg",
  },
];

export const mockInsights: Insight[] = [
  {
    id: "ins_trial_001",
    type: "tip",
    title: "YouTube Premium deneme bitiyor",
    text: "3 gün sonra otomatik yenilenecek. İptal etmezsen kartından çekilir.",
    icon: "alert-triangle",
    severity: "warning",
    paymentAmountTry: 59.99,
    action: { label: "Aboneliklere git", tab: "insights" },
  },
  {
    id: "ins_001",
    type: "trend",
    title: "Getir harcamaların yükseldi",
    text: "Bu ay geçen aya göre %35 fazla harcadın. Bu tempoda aylık 800 ₺'yi aşabilirsin.",
    icon: "trending-up",
    severity: "warning",
    paymentAmountTry: 800,
    action: { label: "Harcamalara git", tab: "expenses" },
  },
  {
    id: "ins_002",
    type: "memory",
    title: "Spotify kullanılmıyor",
    text: "Kasım'dan beri aylık 59,99 ₺ ödüyorsun ama son 28 gündür hiç dinlememişsin.",
    icon: "brain",
    severity: "warning",
    paymentAmountTry: 59.99,
    action: { label: "Aboneliklere git", tab: "insights" },
  },
  {
    id: "ins_price_001",
    type: "tip",
    title: "Netflix zam geliyor",
    text: "Yeni dönemde üyelik ücreti %15 artacak. İstersen alternatifleri değerlendir.",
    icon: "sparkles",
    severity: "info",
    paymentAmountTry: 114.99,
    action: { label: "Detayları gör", tab: "insights" },
  },
];

export interface Subscription {
  id: number
  name: string
  status: string
  date: string
  amount: string
  logoSrc: string
}

export interface SystemMessage {
  id: number
  from: string
  text: string
  time: string
  transactionId?: string
}

export const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    name: "YouTube Premium",
    status: "Deneme Bitiyor",
    date: "3 gün kaldı",
    amount: "59,99 ₺",
    logoSrc: "/Youtube_logo.png",
  },
  {
    id: 2,
    name: "Netflix",
    status: "Aktif",
    date: "12 May",
    amount: "114,99 ₺",
    logoSrc: "/netflix.png",
  },
  {
    id: 3,
    name: "Spotify",
    status: "Kullanılmıyor",
    date: "24 May",
    amount: "59,99 ₺",
    logoSrc: "/Spotify_logo_without_text.svg.png",
  },
  {
    id: 4,
    name: "Turkcell",
    status: "Fatura Kesildi",
    date: "Dün",
    amount: "425,00 ₺",
    logoSrc: "/AMBLEM_SARI.jpg.webp",
  },
]

export const mockSystemMessages: SystemMessage[] = [
  {
    id: 1,
    from: "Turkcell",
    text: "Değerli müşterimiz, 0532******* nolu hattınızın Nisan ayı faturası 425,00 ₺ olarak kesilmiştir. Son ödeme tarihi: 15.05.2026",
    time: "2 saat önce",
    transactionId: "txn_016",
  },
  {
    id: 2,
    from: "Netflix",
    text: "Üyelik ücretlerimiz güncelleniyor. Yeni dönemde üyeliğiniz 114,99 ₺ üzerinden yenilenecektir.",
    time: "Dün",
    transactionId: "txn_008",
  },
]
