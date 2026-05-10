"use client"

import * as React from "react"
import { mockTransactions, mockInsights, mockUser } from "@/lib/data"
import { TransactionItem } from "@/components/shared/transaction-item"
import { InsightCard } from "@/components/shared/insight-card"
import { Bell, TrendingUp, TrendingDown, ArrowRight, AlertCircle, Tag, Lightbulb } from "lucide-react"

import Image from "next/image"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import type { Insight, InsightNavTab } from "@/lib/types"
import { cn } from "@/lib/utils"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Günaydın"
  if (hour >= 12 && hour < 18) return "İyi günler"
  if (hour >= 18 && hour < 22) return "İyi akşamlar"
  return "İyi geceler"
}

function rankInsightsForHome(insights: Insight[]): Insight[] {
  const severityRank: Record<Insight["severity"], number> = { warning: 0, info: 1, positive: 2 }
  const typeRank: Record<Insight["type"], number> = {
    tip: 0,
    anomaly: 1,
    trend: 2,
    memory: 3,
  }
  return [...insights].sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity]
    if (s !== 0) return s
    return typeRank[a.type] - typeRank[b.type]
  })
}

const INSIGHT_TYPE_CHIP: Record<Insight["type"], string> = {
  trend: "Harcama trendi",
  memory: "Hatırlatma",
  tip: "Tasarruf",
  anomaly: "Alışılmadık",
}

const INSIGHT_FILTER_ORDER: Insight["type"][] = ["tip", "anomaly", "trend", "memory"]

export function HomeView({ 
  onNavigate, 
  onTransactionClick, 
  onAddClick 
}: { 
  onNavigate: (tab: string) => void; 
  onTransactionClick?: (id: string) => void;
  onAddClick?: () => void;
}) {
  const isUp = mockUser.delta > 0
  const subscriptionScrollerRef = React.useRef<HTMLDivElement>(null)
  const insightCarouselRef = React.useRef<HTMLDivElement>(null)
  const [insightFilter, setInsightFilter] = React.useState<Insight["type"] | null>(null)
  const [insightCarouselDot, setInsightCarouselDot] = React.useState(0)

  const rankedHomeInsights = React.useMemo(() => rankInsightsForHome(mockInsights), [])
  const homeInsightPool = React.useMemo(() => rankedHomeInsights.slice(0, 8), [rankedHomeInsights])
  const visibleHomeInsights = React.useMemo(() => {
    if (insightFilter == null) return homeInsightPool
    return homeInsightPool.filter((i) => i.type === insightFilter)
  }, [homeInsightPool, insightFilter])

  const insightTypesForChips = React.useMemo(() => {
    const has = new Set(rankedHomeInsights.map((i) => i.type))
    return INSIGHT_FILTER_ORDER.filter((t) => has.has(t))
  }, [rankedHomeInsights])

  const onInsightCarouselScroll = React.useCallback(() => {
    const el = insightCarouselRef.current
    if (!el || visibleHomeInsights.length === 0) return
    const first = el.children[0] as HTMLElement | undefined
    if (!first) return
    const gap = 12
    const step = first.offsetWidth + gap
    if (step < 8) return
    const idx = Math.round(el.scrollLeft / step)
    setInsightCarouselDot(Math.min(Math.max(0, idx), visibleHomeInsights.length - 1))
  }, [visibleHomeInsights.length])

  React.useEffect(() => {
    const el = insightCarouselRef.current
    if (el) el.scrollLeft = 0
    setInsightCarouselDot(0)
  }, [insightFilter, visibleHomeInsights.length])

  React.useEffect(() => {
    const el = subscriptionScrollerRef.current
    if (!el) return

    let index = 0
    const cardCount = 3

    const advance = () => {
      const first = el.querySelector(":scope > button")
      if (!first) return
      const gap = 8
      const step = (first as HTMLElement).offsetWidth + gap
      index = (index + 1) % cardCount
      const left = index * step
      el.scrollTo({ left, behavior: index === 0 ? "auto" : "smooth" })
    }

    const intervalId = setInterval(advance, 4200)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <header className="px-4 pt-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] overflow-hidden relative ring-1 ring-black/5">
            <Image
              src={mockUser.avatar}
              alt={`${mockUser.name} profil fotoğrafı`}
              fill
              className="object-cover"
              sizes="44px"
              priority
            />
          </div>
          <div>
            <p className="text-[13px] font-medium leading-tight" style={{ color: "var(--text-tertiary)" }}>{getGreeting()},</p>
            <h1 className="text-[18px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{mockUser.name}</h1>
          </div>
        </div>
        <button
          className="w-10 h-10 rounded-[14px] flex items-center justify-center relative active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--danger)" }} />
        </button>
      </header>

      {/* ── Abonelik tasarrufu — otomatik kaydırmalı slide kartlar ── */}
      <div className="px-4 mb-3">
        <p
          className="text-[10px] font-bold uppercase tracking-wide leading-none mb-2 px-0.5"
          style={{ color: "var(--text-tertiary)" }}
        >
          Abonelik tasarrufu
        </p>
        <div
          ref={subscriptionScrollerRef}
          className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-px scroll-smooth"
        >
            <button
              type="button"
              onClick={onAddClick}
              className="subscription-slide-card subscription-slide-card--urgent flex-shrink-0 snap-start text-left w-[min(46vw,148px)] rounded-[12px] p-2.5 active:scale-[0.98] transition-transform"
            >
              <span
                className="subscription-slide-card__badge subscription-slide-card__badge--compact subscription-slide-card__badge--corner"
                data-tone="urgent"
              >
                <AlertCircle className="w-3 h-3" />
                Acil
              </span>
              <div className="pr-12">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full overflow-hidden relative flex-shrink-0 nudge__icon--brand">
                    <BrandLogoSlot src="/Youtube_logo.png" alt="YouTube" />
                  </div>
                  <span className="text-[12px] font-semibold leading-tight line-clamp-1" style={{ color: "var(--text-primary)" }}>
                    YouTube Premium
                  </span>
                </div>
                <p className="text-[10px] leading-tight line-clamp-1 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Deneme bitiyor · ~60 ₺
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={onAddClick}
              className="subscription-slide-card subscription-slide-card--deal flex-shrink-0 snap-start text-left w-[min(46vw,148px)] rounded-[12px] p-2.5 active:scale-[0.98] transition-transform"
            >
              <span
                className="subscription-slide-card__badge subscription-slide-card__badge--compact subscription-slide-card__badge--corner"
                data-tone="deal"
              >
                <Tag className="w-3 h-3" />
                Teklif
              </span>
              <div className="pr-12">
                <p className="text-[12px] font-semibold leading-tight line-clamp-1" style={{ color: "var(--text-primary)" }}>
                  Spotify Duo
                </p>
                <p className="text-[10px] leading-tight mt-0.5 line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                  İlk 3 ay %50
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={onAddClick}
              className="subscription-slide-card subscription-slide-card--tip flex-shrink-0 snap-start text-left w-[min(46vw,148px)] rounded-[12px] p-2.5 active:scale-[0.98] transition-transform"
            >
              <span
                className="subscription-slide-card__badge subscription-slide-card__badge--compact subscription-slide-card__badge--corner"
                data-tone="tip"
              >
                <Lightbulb className="w-3 h-3" />
                Öneri
              </span>
              <div className="pr-12">
                <p className="text-[12px] font-semibold leading-tight line-clamp-1" style={{ color: "var(--text-primary)" }}>
                  Netflix
                </p>
                <p className="text-[10px] leading-tight mt-0.5 line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                  Temel plana geç
                </p>
              </div>
            </button>
        </div>
      </div>

      {/* ── Hero Bakiye + kompakt dönem özeti ── */}
      <div className="px-4 mb-5">
        <div className="wise-card p-4 sm:p-5" style={{ overflow: "visible" }}>
          <p className="section-header !p-0 mb-2">Bu Ay Toplam Harcanan</p>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-end gap-2 min-w-0">
              <h2 className="text-[44px] sm:text-[48px] font-mono font-bold leading-none tracking-tighter" style={{ color: "var(--text-primary)" }}>
                {mockUser.thisMonthSpend.toLocaleString("tr-TR")}
              </h2>
              <span className="text-[18px] sm:text-[20px] font-mono mb-1 shrink-0" style={{ color: "var(--text-disabled)" }}>₺</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("insights")}
              className="shrink-0 flex flex-col items-center gap-2 max-w-[112px] rounded-[14px] p-1 -m-1 active:scale-[0.96] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-[var(--bg-surface)]"
              aria-label="Fello'ya sor — içgörülere git"
            >
              <div
                className="relative w-14 h-14 sm:w-[58px] sm:h-[58px] rounded-[14px] sm:rounded-[15px] overflow-hidden fello-logo-glow-pulse"
              >
                <Image src="/logo.svg" alt="" fill className="object-cover" sizes="58px" aria-hidden />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold leading-tight text-center w-full" style={{ color: "var(--text-secondary)" }}>
                Fello&apos;ya Sor
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-[8px] text-[11px] sm:text-[12px] font-semibold"
              style={{
                backgroundColor: isUp ? "var(--danger-muted)" : "var(--positive-muted)",
                color: isUp ? "var(--danger)" : "var(--accent-text)",
              }}
            >
              {isUp ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              {isUp ? "+" : ""}{mockUser.delta}%
            </div>
            <p className="text-[11px] sm:text-[12px]" style={{ color: "var(--text-tertiary)" }}>geçen aya kıyasla</p>
          </div>

          <div className="pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex gap-1.5 items-stretch">
              {(
                [
                  { label: "Bugün", value: "245", period: "today" as const, trend: "up" as const },
                  { label: "Bu Hafta", value: "1.450", period: "week" as const, trend: "down" as const },
                  {
                    label: "Bu Ay",
                    value: mockUser.thisMonthSpend.toLocaleString("tr-TR"),
                    period: "month" as const,
                    trend: mockUser.delta > 0 ? ("up" as const) : ("down" as const),
                  },
                ] as const
              ).map((item) => {
                const isTrendUp = item.trend === "up"
                return (
                <button
                  key={item.period}
                  type="button"
                  onClick={() => onNavigate("expenses")}
                  aria-label={`${item.label}: ${item.value} ₺, önceki döneme göre ${isTrendUp ? "daha yüksek" : "daha düşük"}`}
                  className="relative flex-1 min-w-0 rounded-[10px] px-2 py-1.5 pr-7 text-left active:scale-[0.98] transition-transform hover:opacity-90"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                >
                  <span
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-[6px]"
                    style={{
                      backgroundColor: isTrendUp ? "var(--danger-muted)" : "var(--positive-muted)",
                      color: isTrendUp ? "var(--danger)" : "var(--accent-text)",
                    }}
                    aria-hidden
                  >
                    {isTrendUp ? (
                      <TrendingUp className="w-3 h-3 shrink-0" strokeWidth={2.25} />
                    ) : (
                      <TrendingDown className="w-3 h-3 shrink-0" strokeWidth={2.25} />
                    )}
                  </span>
                  <p className="text-[8px] font-bold uppercase tracking-wide leading-none mb-0.5 truncate pr-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {item.label}
                  </p>
                  <p className="text-[12px] font-mono font-semibold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                    {item.value}
                    <span className="text-[10px] font-mono font-medium ml-0.5" style={{ color: "var(--text-disabled)" }}>
                      ₺
                    </span>
                  </p>
                </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Akıllı Öneriler ── */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>Akıllı Öneriler</h3>
          <button
            type="button"
            onClick={() => onNavigate("insights")}
            className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-80"
            style={{ color: "var(--accent-text)" }}
          >
            Tümü <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {visibleHomeInsights.length === 0 ? (
          <p className="text-[13px] leading-relaxed py-4 px-1" style={{ color: "var(--text-secondary)" }}>
            {insightFilter == null
              ? "Şimdilik öneri yok — harcamalar eklendikçe burada görünecek."
              : "Bu kategoride şu an öneri yok."}
          </p>
        ) : (
          <>
            <div
              ref={insightCarouselRef}
              onScroll={onInsightCarouselScroll}
              className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1 -mx-4 px-4"
            >
              {visibleHomeInsights.map((insight) => (
                <div key={insight.id} className="snap-center shrink-0 w-[min(86vw,300px)]">
                  <InsightCard
                    insight={insight}
                    compact
                    showCompactCta
                    className="mb-0 h-full"
                    onNavigate={(tab: InsightNavTab) => onNavigate(tab)}
                  />
                </div>
              ))}
            </div>
            {visibleHomeInsights.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2" aria-label="Öneri sayfaları">
                {visibleHomeInsights.map((insight, i) => (
                  <span
                    key={insight.id}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === insightCarouselDot ? "w-4 bg-[var(--accent)]" : "w-1.5 bg-[var(--border-subtle)]",
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-px">
          <button
            type="button"
            onClick={() => setInsightFilter(null)}
            className={cn("chip whitespace-nowrap shrink-0", insightFilter === null && "chip--active")}
          >
            Tümü
          </button>
          {insightTypesForChips.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInsightFilter(t)}
              className={cn("chip whitespace-nowrap shrink-0", insightFilter === t && "chip--active")}
            >
              {INSIGHT_TYPE_CHIP[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Son Harcamalar ── */}
      <div className="px-4 flex-1 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Son Harcamalar</h3>
          <button onClick={() => onNavigate("expenses")} className="text-[12px] font-semibold flex items-center gap-1 hover:opacity-80" style={{ color: "var(--accent-text)" }}>
            Tümünü Gör <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <p className="section-header">Bugün</p>
        {mockTransactions.slice(0, 3).map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} onClick={onTransactionClick} />
        ))}

        <p className="section-header">Dün</p>
        {mockTransactions.slice(3, 6).map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} onClick={onTransactionClick} />
        ))}
      </div>
    </div>
  )
}
