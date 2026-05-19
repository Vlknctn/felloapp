"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle } from "@/lib/icons"
import type { SubscriptionDealDetail } from "@/lib/types"
import {
  CompareColumns,
  dealCategoryLabel,
  FeatureCompareTable,
  formatDealTry,
  ProviderLogo,
  SavingsPill,
} from "@/components/shared/subscription-deal-ui"
import { ArrowRight } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function SubscriptionDealSheet({
  open,
  detail,
  onClose,
  onCopied,
}: {
  open: boolean
  detail: SubscriptionDealDetail | null
  onClose: () => void
  onCopied?: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  const [appShell, setAppShell] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setAppShell(document.getElementById("fello-app-shell"))
  }, [])

  React.useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const copySummary = React.useCallback(async () => {
    if (!detail) return
    try {
      await navigator.clipboard.writeText(detail.summary)
      setCopied(true)
      onCopied?.()
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard blocked */
    }
  }, [detail, onCopied])

  if (!open || !detail || !appShell) return null

  const savingsPct = Math.round(
    (detail.monthlySavingsTry / detail.current.monthlyPriceTry) * 100,
  )

  return createPortal(
    <div className="absolute inset-0 z-40">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-deal-title"
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[24px] border-t border-[var(--border-subtle)] max-h-[90%]"
        style={{ backgroundColor: "var(--bg-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "var(--border-default)" }} />
        </div>

        <div className="flex items-start justify-between gap-3 px-4 pt-1 pb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              {dealCategoryLabel(detail.category)} · Paket karşılaştırması
            </p>
            <div className="mt-2 flex items-center gap-2">
              <ProviderLogo
                provider={detail.current.provider}
                logoUrl={detail.current.logoUrl}
                variant="current"
                size="sm"
              />
              <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
              <ProviderLogo
                provider={detail.recommended.provider}
                logoUrl={detail.recommended.logoUrl}
                variant="recommended"
                size="sm"
              />
              <h2
                id="sub-deal-title"
                className="min-w-0 flex-1 text-[15px] font-bold leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {detail.recommended.provider} ile aynı içerik
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--bg-elevated)" }}
            aria-label="Kapat"
          >
            <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
          <div className="sub-deal-sheet-hero">
            <div className="sub-deal-sheet-hero__main">
              <SavingsPill monthlySavingsTry={detail.monthlySavingsTry} className="!text-[13px] !px-3 !py-1.5" />
              <p className="sub-deal-sheet-hero__yearly">
                Yıllık ≈ {formatDealTry(detail.yearlySavingsTry)} tasarruf
                <span className="sub-deal-sheet-hero__pct"> (%{savingsPct} daha ucuz)</span>
              </p>
            </div>
          </div>

          <div className="sub-deal-sheet-compare-wrap">
            <CompareColumns deal={detail} />
          </div>

          <p className="mt-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            İçerik karşılaştırması
          </p>
          <div className="mt-2">
            <FeatureCompareTable deal={detail} />
          </div>

          <p
            className="mt-4 rounded-[14px] border border-[var(--border-subtle)] p-3.5 text-[13px] leading-[1.55]"
            style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-base)" }}
          >
            {detail.summary}
          </p>
          <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--text-disabled)" }}>
            Demo tarife verisi. Geçiş öncesi taahhüt ve güncel fiyatları operatör sitesinden doğrula.
          </p>
        </div>

        <div className="shrink-0 border-t border-[var(--border-subtle)] px-4 py-3 pb-5">
          <button
            type="button"
            onClick={copySummary}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[14px] font-bold transition-opacity",
            )}
            style={{
              backgroundColor: copied ? "var(--positive-muted)" : "var(--accent)",
              color: copied ? "var(--positive)" : "var(--on-accent)",
            }}
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Kopyalandı
              </>
            ) : (
              "Özeti kopyala"
            )}
          </button>
        </div>
      </div>
    </div>,
    appShell,
  )
}
