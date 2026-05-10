"use client"

import React from "react"
import { ArrowRight } from "lucide-react"
import { Insight, InsightNavTab } from "@/lib/types"
import { cn } from "@/lib/utils"

const severityConfig = {
  warning: {
    bg: "var(--warning-muted)",
    iconColor: "var(--warning)",
    label: "Dikkat",
  },
  info: {
    bg: "var(--positive-muted)",
    iconColor: "var(--accent-text)",
    label: "Bilgi",
  },
  positive: {
    bg: "var(--positive-muted)",
    iconColor: "var(--accent-text)",
    label: "Harika",
  },
}

const typeLabel: Record<string, string> = {
  trend: "Harcama Trendi",
  memory: "Hatırlatma",
  tip: "Tasarruf Önerisi",
  anomaly: "Alışılmadık",
}

function formatExpenseHighlightTry(amount: number): string {
  const n = Math.abs(amount)
  const fractionDigits = n % 1 === 0 ? 0 : 2
  return `−${n.toLocaleString("tr-TR", { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })}`
}

export function InsightCard({
  insight,
  compact = false,
  showCompactCta = false,
  className,
  onClick,
  onNavigate,
  fallbackNavigateTab = "insights",
}: {
  insight: Insight
  compact?: boolean
  /** Ana sayfa carousel: kısa CTA satırı */
  showCompactCta?: boolean
  className?: string
  onClick?: () => void
  /** Verildiğinde kart tıklanınca `action.tab` veya `fallbackNavigateTab` ile sekme değişir */
  onNavigate?: (tab: InsightNavTab) => void
  fallbackNavigateTab?: InsightNavTab
}) {
  const config = severityConfig[insight.severity as keyof typeof severityConfig] || severityConfig.info
  const ctaLabel = insight.action?.label ?? "İncele"
  const interactive = Boolean(onNavigate || onClick)
  const hasAmount = insight.paymentAmountTry != null

  const handleActivate = () => {
    if (onNavigate) {
      onNavigate(insight.action?.tab ?? fallbackNavigateTab)
      return
    }
    onClick?.()
  }
  const showCtaRow = !compact || showCompactCta

  const keyActivate = (e: React.KeyboardEvent) => {
    if (!interactive) return
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    handleActivate()
  }

  return (
    <div
      className={cn(
        "transition-all overflow-hidden rounded-[16px] border border-[var(--border-subtle)]",
        interactive && "cursor-pointer hover:bg-[var(--bg-overlay)] active:scale-[0.99]",
        className,
      )}
      style={{ backgroundColor: "var(--bg-surface)" }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? handleActivate : undefined}
      onKeyDown={interactive ? keyActivate : undefined}
    >
      <div className="p-4 flex flex-col">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest truncate" style={{ color: "var(--text-tertiary)" }}>
            {typeLabel[insight.type] || "Analiz"}
          </span>
          <span
            className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-[4px]"
            style={{ backgroundColor: config.bg, color: config.iconColor }}
          >
            {config.label}
          </span>
        </div>

        <p className="text-[14px] leading-[1.5] font-semibold line-clamp-4" style={{ color: "var(--text-primary)" }}>
          {insight.text}
        </p>

        {(showCtaRow || hasAmount) && (
          <div
            className={cn(
              "mt-3 flex min-h-[28px] items-end gap-2",
              showCtaRow && hasAmount && "justify-between",
              !showCtaRow && hasAmount && "justify-end",
            )}
          >
            {showCtaRow ? (
              <div
                className={cn(
                  "flex items-center gap-1 text-[12px] font-bold min-w-0",
                  hasAmount ? "flex-1 pr-2" : "",
                  !hasAmount && "w-full",
                )}
                style={{ color: "var(--accent-text)" }}
              >
                {ctaLabel} <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
              </div>
            ) : null}
            {hasAmount && insight.paymentAmountTry != null && (
              <p
                className={cn(
                  "font-mono font-bold leading-none tracking-tight text-right whitespace-nowrap flex-shrink-0 self-end",
                  compact ? "text-[16px]" : "text-[19px]",
                )}
                style={{ color: "var(--danger)" }}
                aria-label={`Tahmini ödeme ${formatExpenseHighlightTry(insight.paymentAmountTry)} Türk lirası`}
              >
                {formatExpenseHighlightTry(insight.paymentAmountTry)}
                <span
                  className={cn(
                    "font-mono font-semibold align-top ml-0.5",
                    compact ? "text-[10px]" : "text-[12px]",
                  )}
                  style={{ color: "var(--danger)" }}
                  aria-hidden
                >
                  ₺
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
