import type { Transaction } from "./types"
import { buildSubscriptionDealsReply } from "./subscription-deals"

export const SUGGESTED_QUESTIONS = [
  "Bugün ne kadar harcadım?",
  "Bu ay kahve harcamam ne?",
  "En çok hangi markaya gittim?",
  "Aboneliklerim ne durumda?",
  "Daha uygun paket var mı?",
  "Geçen hafta özeti ver",
] as const

export const CHAT_WELCOME_TEXT =
  "Merhaba! Ben Fello AI — aboneliklerini ve harcamalarını e-posta ve banka hareketlerinden hatırlıyorum. Aşağıdan hazır bir soru seçebilir veya kendi sorunu yazabilirsin."

function formatTry(amount: number) {
  return amount.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺"
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function buildDailySummary(transactions: Transaction[]): string {
  const today = startOfDay(new Date())
  const todayTx = transactions.filter((tx) => isSameDay(new Date(tx.date), today))

  if (todayTx.length === 0) {
    return "Bugün henüz kayıtlı harcaman yok. İşlem ekledikçe veya e-posta/banka bağlantısından veri geldikçe burada günlük özetini göreceksin."
  }

  const total = todayTx.reduce((s, tx) => s + Math.abs(tx.amount), 0)
  const byCategory: Record<string, number> = {}
  for (const tx of todayTx) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + Math.abs(tx.amount)
  }
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  const merchants = [...new Set(todayTx.map((t) => t.merchant))]

  let text = `Bugün ${todayTx.length} işlemle toplam ${formatTry(total)} harcadın.`
  if (topCategory) {
    text += ` En yoğun kategori ${topCategory[0]} (${formatTry(topCategory[1])}).`
  }
  if (merchants.length > 0) {
    const list = merchants.slice(0, 3).join(", ")
    text += ` Ziyaret ettiğin markalar: ${list}${merchants.length > 3 ? " ve diğerleri" : ""}.`
  }
  return text
}

function sumCategory(transactions: Transaction[], category: string, since: Date) {
  return transactions
    .filter((tx) => tx.category === category && new Date(tx.date) >= since)
    .reduce((s, tx) => s + Math.abs(tx.amount), 0)
}

function topMerchant(transactions: Transaction[], since: Date) {
  const totals: Record<string, number> = {}
  for (const tx of transactions) {
    if (new Date(tx.date) < since) continue
    totals[tx.merchant] = (totals[tx.merchant] ?? 0) + Math.abs(tx.amount)
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return sorted[0]
}

function countCategoryTx(transactions: Transaction[], category: string, since: Date) {
  return transactions.filter(
    (tx) => tx.category === category && new Date(tx.date) >= since,
  ).length
}

export function generateDemoReply(question: string, transactions: Transaction[]): string {
  const q = question.toLowerCase().trim()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  if (
    q.includes("merhaba") ||
    q.includes("selam") ||
    q.includes("hey") ||
    q === "naber" ||
    q.includes("nasılsın")
  ) {
    return "İyiyim, teşekkürler! Harcamalarınla ilgili ne öğrenmek istersin? Günlük özet, kategori analizi veya abonelik karşılaştırması yapabilirim."
  }

  if (q.includes("bugün") || q.includes("günün") || q.includes("günlük")) {
    return buildDailySummary(transactions)
  }

  if (q.includes("kahve") || q.includes("starbucks") || q.includes("coffe")) {
    const total = sumCategory(transactions, "Kahve", monthStart)
    const count = countCategoryTx(transactions, "Kahve", monthStart)
    if (count === 0) {
      return "Bu ay kahve kategorisinde kayıtlı harcaman görünmüyor."
    }
    const avg = Math.round(total / count)
    return `Bu ay kahve harcaman ${formatTry(total)} — ${count} işlem, ortalama ${formatTry(avg)} / ziyaret. Hafta içi öğleden sonraları daha sık harcama yapıyorsun.`
  }

  if (q.includes("marka") || q.includes("en çok") || q.includes("nerede")) {
    const top = topMerchant(transactions, monthStart)
    if (!top) return "Bu ay henüz yeterli harcama kaydı yok; birkaç işlem sonrası marka analizini gösterebilirim."
    return `Bu ay en çok ${top[0]} markasında harcadın — toplam ${formatTry(top[1])}. İstersen kategori kırılımını da çıkarabilirim.`
  }

  if (
    q.includes("daha ucuz") ||
    q.includes("daha uygun") ||
    q.includes("karşılaştır") ||
    q.includes("paket") ||
    q.includes("turkcell") ||
    q.includes("türk telekom") ||
    q.includes("operatör") ||
    q.includes("vodafone")
  ) {
    return buildSubscriptionDealsReply(transactions)
  }

  if (q.includes("abonelik") || q.includes("netflix") || q.includes("spotify")) {
    const deals = buildSubscriptionDealsReply(transactions)
    return `${deals}\n\nEk not: YouTube Premium deneme süren 3 gün içinde bitiyor. Spotify son 28 gündür kullanılmıyor — iptal etmeyi düşünebilirsin.`
  }

  if (q.includes("hafta") || q.includes("7 gün")) {
    const weekTx = transactions.filter((tx) => new Date(tx.date) >= weekStart)
    const total = weekTx.reduce((s, tx) => s + Math.abs(tx.amount), 0)
    if (weekTx.length === 0) {
      return "Son 7 günde kayıtlı harcaman yok."
    }
    const dailyAvg = Math.round(total / 7)
    return `Son 7 günde ${weekTx.length} işlem yaptın, toplam ${formatTry(total)} harcadın — günlük ortalama yaklaşık ${formatTry(dailyAvg)}.`
  }

  if ((q.includes("ay") && q.includes("özet")) || q.includes("bu ay ne")) {
    const monthTx = transactions.filter((tx) => new Date(tx.date) >= monthStart)
    const total = monthTx.reduce((s, tx) => s + Math.abs(tx.amount), 0)
    return `Bu ay ${monthTx.length} işlemle ${formatTry(total)} harcadın. Market ve ulaşım kategorileri öne çıkıyor; abonelikler için Fello AI → Abonelikler sekmesine bakabilirsin.`
  }

  if (q.includes("tasarruf") || q.includes("tasarruf et") || q.includes("azalt")) {
    return "Hızlı öneriler: kullanılmayan abonelikleri iptal et, kahve harcamasını haftada 2 gün sınırla, market alışverişini tek seferde topla. Abonelik karşılaştırması için «Daha uygun paket var mı?» diye sorabilirsin."
  }

  if (q.includes("fatura") || q.includes("artış") || q.includes("creep")) {
    return "Fatura hafızanda aynı işletmede geçen aya göre artış gösteren kalemler var. Fello AI → Özet sekmesinde «Fatura hafızası» kartlarından detaylara ulaşabilirsin."
  }

  return `«${question}» için kayıtlarına baktım. Daha net yanıt için «bugün», «kahve», «abonelik» veya «geçen hafta özeti» gibi ifadeler kullanabilirsin; istersen hazır sorulardan birini seç.`
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  variant?: "welcome" | "daily-summary"
}

export function createWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    text: CHAT_WELCOME_TEXT,
    variant: "welcome",
  }
}

export function createDailySummaryMessage(transactions: Transaction[]): ChatMessage {
  return {
    id: "daily-summary",
    role: "assistant",
    text: buildDailySummary(transactions),
    variant: "daily-summary",
  }
}

export function createInitialChatMessages(transactions: Transaction[]): ChatMessage[] {
  return [createWelcomeMessage(), createDailySummaryMessage(transactions)]
}
