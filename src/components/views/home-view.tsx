"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { mockInsights, mockUser } from "@/lib/data"
import { springSnappy } from "@/lib/motion"
import { mergeAllInsights } from "@/lib/subscription-deals"
import { useApp } from "@/contexts/app-context"
import type { BillCreepDetail, SubscriptionDealDetail } from "@/lib/types"
import { TransactionItem } from "@/components/shared/transaction-item"
import { InsightCard } from "@/components/shared/insight-card"
import { Search, ArrowRight, AlertCircle } from "@/lib/icons"
import Image from "next/image"
import type { Insight, InsightNavTab } from "@/lib/types"
import { cn } from "@/lib/utils"

const TR_DAY_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: "Günaydın", emoji: "☀️" }
  if (hour >= 12 && hour < 18) return { text: "İyi günler", emoji: "☀️" }
  if (hour >= 18 && hour < 22) return { text: "İyi akşamlar", emoji: "🌙" }
  return { text: "İyi geceler", emoji: "🌙" }
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function rankInsightsForHome(insights: Insight[]): Insight[] {
  const severityRank: Record<Insight["severity"], number> = { warning: 0, info: 1, positive: 2 }
  const typeRank: Record<Insight["type"], number> = { tip: 0, anomaly: 1, trend: 2, memory: 3 }
  return [...insights].sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity]
    if (s !== 0) return s
    return typeRank[a.type] - typeRank[b.type]
  })
}

export function HomeView({
  onNavigate,
  onTransactionClick,
  onSearchClick,
  onBillCreepOpen,
  onSubscriptionDealOpen,
}: {
  onNavigate: (tab: string) => void
  onTransactionClick?: (id: string) => void
  onAddClick?: () => void
  onSearchClick?: () => void
  onBillCreepOpen?: (detail: BillCreepDetail) => void
  onSubscriptionDealOpen?: (detail: SubscriptionDealDetail) => void
}) {
  const { transactions } = useApp()
  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const weekDays = React.useMemo(() => {
    const days: Date[] = []
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      days.push(d)
    }
    return days
  }, [today])

  const [selectedDate, setSelectedDate] = React.useState<Date>(today)
  const insightCarouselRef = React.useRef<HTMLDivElement>(null)
  const [insightCarouselDot, setInsightCarouselDot] = React.useState(0)

  const [apiInsights, setApiInsights] = React.useState<Insight[] | null>(null)

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/insights")
        if (!res.ok) return
        const data = (await res.json()) as { insights: Insight[] }
        if (!cancelled && Array.isArray(data.insights)) setApiInsights(data.insights)
      } catch {
        // client merge fallback
      }
    })()
    return () => {
      cancelled = true
    }
  }, [transactions])

  const allInsights = React.useMemo(
    () => apiInsights ?? mergeAllInsights(mockInsights, transactions),
    [apiInsights, transactions],
  )

  const rankedInsights = React.useMemo(
    () => rankInsightsForHome(allInsights).slice(0, 5),
    [allInsights],
  )

  const txDaySet = React.useMemo(() => {
    const set = new Set<number>()
    for (const tx of transactions) {
      const d = new Date(tx.date)
      d.setHours(0, 0, 0, 0)
      set.add(d.getTime())
    }
    return set
  }, [transactions])

  const selectedDayTxns = React.useMemo(
    () => transactions.filter((tx) => isSameDay(new Date(tx.date), selectedDate)),
    [selectedDate, transactions]
  )

  const upcomingWarnings = React.useMemo(
    () => allInsights.filter((i) => i.severity === "warning" && i.paymentAmountTry),
    [allInsights],
  )

  const upcomingTotal = upcomingWarnings.reduce((sum, i) => sum + (i.paymentAmountTry ?? 0), 0)

  const onInsightCarouselScroll = React.useCallback(() => {
    const el = insightCarouselRef.current
    if (!el || rankedInsights.length === 0) return
    const first = el.children[0] as HTMLElement | undefined
    if (!first) return
    const step = first.offsetWidth + 12
    if (step < 8) return
    const idx = Math.round(el.scrollLeft / step)
    setInsightCarouselDot(Math.min(Math.max(0, idx), rankedInsights.length - 1))
  }, [rankedInsights.length])

  const greeting = getGreeting()
  const reduceMotion = useReducedMotion()

  const selectedLabel = React.useMemo(() => {
    if (isSameDay(selectedDate, today)) return "Bugün"
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (isSameDay(selectedDate, yesterday)) return "Dün"
    return selectedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
  }, [selectedDate, today])

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Header ── */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSnappy}
        className="px-4 pt-5 pb-3 flex items-start justify-between"
      >
        <div>
          <p className="text-[13px] font-medium leading-tight" style={{ color: "var(--text-tertiary)" }}>
            {greeting.text} {greeting.emoji}
          </p>
          <h1 className="text-[22px] font-bold leading-tight mt-0.5" style={{ color: "var(--text-primary)" }}>
            {mockUser.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={onSearchClick}
            className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-all"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Ara"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-[12px] overflow-hidden relative ring-2 ring-[var(--border-subtle)]">
            <Image
              src={mockUser.avatar}
              alt={`${mockUser.name} profil`}
              fill
              className="object-cover"
              sizes="36px"
              priority
            />
          </div>
        </div>
      </motion.header>

      {/* ── Alert chip ── */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springSnappy, delay: 0.05 }}
        className="px-4 mb-5"
      >
        <button
          type="button"
          onClick={() => onNavigate("insights")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold active:scale-[0.97] transition-transform"
          style={{ backgroundColor: "var(--danger-muted)", color: "var(--danger)" }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Yaklaşan ödemeleri incele
        </button>
      </motion.div>

      {/* ── Hero özet ── */}
      <div className="px-4 mb-7">
        <p
          className="text-[27px] leading-[1.28] font-light"
          style={{ color: "var(--text-tertiary)" }}
        >
          <strong className="font-bold" style={{ color: "var(--text-primary)" }}>
            {upcomingWarnings.length} ödemen
          </strong>{" "}
          yaklaşıyor, bu ay{" "}
          <strong className="font-bold" style={{ color: "var(--text-primary)" }}>
            {mockUser.thisMonthSpend.toLocaleString("tr-TR")} ₺
          </strong>{" "}
          harcandı; bunlar için toplam{" "}
          <strong className="font-bold" style={{ color: "var(--text-primary)" }}>
            {Math.round(upcomingTotal)} ₺
          </strong>{" "}
          öngörülüyor
        </p>
      </div>

      {/* ── Tarih şeridi ── */}
      <div className="px-4 mb-4">
        <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, today)
            const hasTx = txDaySet.has(day.getTime())
            return (
              <button
                key={day.getTime()}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center py-2.5 px-2 rounded-[16px] min-w-[46px] gap-1 transition-all active:scale-95 flex-1",
                  isSelected ? "text-white" : "text-[var(--text-tertiary)]"
                )}
                style={{
                  backgroundColor: isSelected ? "var(--accent)" : "transparent",
                }}
              >
                <span className="text-[10px] font-semibold leading-none">
                  {TR_DAY_SHORT[day.getDay()]}
                </span>
                <span
                  className={cn(
                    "text-[18px] font-bold leading-none",
                    !isSelected && isToday && "text-[var(--text-primary)]"
                  )}
                >
                  {day.getDate()}
                </span>
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    hasTx
                      ? isSelected
                        ? "bg-white/60"
                        : "bg-[var(--accent)]"
                      : "opacity-0"
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Seçili güne ait işlemler ── */}
      <div className="px-4 mb-5 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {selectedLabel}
          </h3>
          <button
            onClick={() => onNavigate("expenses")}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-80"
            style={{ color: "var(--accent-text)" }}
          >
            Tümünü Gör <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {selectedDayTxns.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
            Bu gün için işlem yok
          </p>
        ) : (
          selectedDayTxns.map((tx, i) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={onTransactionClick}
              index={i}
            />
          ))
        )}
      </div>

      {/* ── Akıllı Öneriler ── */}
      <div className="px-4 pb-[72px]">
        <div className="flex items-end justify-between mb-3 gap-3">
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              Akıllı Öneriler
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              CogniMemo&apos;nun senin için seçtiği {rankedInsights.length} öneri
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("insights")}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-80 shrink-0 pb-0.5"
            style={{ color: "var(--accent-text)" }}
          >
            Tümü <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div
          ref={insightCarouselRef}
          onScroll={onInsightCarouselScroll}
          className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1 -mx-4 px-4"
        >
          {rankedInsights.map((insight) => (
            <div key={insight.id} className="snap-center shrink-0 w-[min(78vw,280px)]">
              <InsightCard
                insight={insight}
                compact
                showCompactCta
                className="h-full"
                onNavigate={(tab: InsightNavTab) => onNavigate(tab)}
                onBillCreepOpen={onBillCreepOpen}
                onSubscriptionDealOpen={onSubscriptionDealOpen}
              />
            </div>
          ))}
        </div>
        {rankedInsights.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2" aria-label="Öneri sayfaları">
            {rankedInsights.map((insight, i) => (
              <span
                key={insight.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === insightCarouselDot ? "w-4 bg-[var(--accent)]" : "w-1.5 bg-[var(--border-subtle)]"
                )}
                aria-hidden
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
