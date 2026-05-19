"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, AlertCircle, Brain, Lightbulb } from "@/lib/icons"
import { springSnappy } from "@/lib/motion"
import { BillCreepDetail, Insight, InsightNavTab, SubscriptionDealDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

const severityConfig = {
  warning: {
    bg: "var(--warning-muted)",
    iconColor: "var(--warning)",
    label: "Dikkat",
  },
  info: {
    bg: "var(--accent-muted)",
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
  trend: "Trend",
  memory: "Fello AI",
  tip: "Öneri",
  anomaly: "Anomali",
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "alert-triangle": AlertCircle,
  brain: Brain,
  "trending-up": ArrowRight,
  sparkles: Lightbulb,
}

function formatExpenseHighlightTry(amount: number): string {
  const n = Math.abs(amount)
  const fractionDigits = n % 1 === 0 ? 0 : 2
  return `−${n.toLocaleString("tr-TR", { minimumFractionDigits: fractionDigits, maximumFractionDigits: 2 })} ₺`
}

export function InsightCard({
  insight,
  compact = false,
  showCompactCta = false,
  className,
  onClick,
  onNavigate,
  onBillCreepOpen,
  onSubscriptionDealOpen,
  fallbackNavigateTab = "insights",
}: {
  insight: Insight
  compact?: boolean
  showCompactCta?: boolean
  className?: string
  onClick?: () => void
  onNavigate?: (tab: InsightNavTab) => void
  onBillCreepOpen?: (detail: BillCreepDetail) => void
  onSubscriptionDealOpen?: (detail: SubscriptionDealDetail) => void
  fallbackNavigateTab?: InsightNavTab
}) {
  const reduceMotion = useReducedMotion()
  const config = severityConfig[insight.severity as keyof typeof severityConfig] || severityConfig.info
  const ctaLabel = insight.action?.label ?? "İncele"
  const interactive = Boolean(onNavigate || onClick)
  const hasAmount = insight.paymentAmountTry != null
  const Icon = iconMap[insight.icon] ?? Lightbulb
  const showCtaRow = !compact || showCompactCta

  const handleActivate = () => {
    if (insight.subscriptionDeal && onSubscriptionDealOpen) {
      onSubscriptionDealOpen(insight.subscriptionDeal)
      return
    }
    if (insight.billCreep && onBillCreepOpen) {
      onBillCreepOpen(insight.billCreep)
      return
    }
    if (onNavigate) {
      onNavigate(insight.action?.tab ?? fallbackNavigateTab)
      return
    }
    onClick?.()
  }

  const keyActivate = (e: React.KeyboardEvent) => {
    if (!interactive) return
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    handleActivate()
  }

  return (
    <motion.div
      layout={!reduceMotion}
      whileHover={interactive && !reduceMotion ? { y: -2 } : undefined}
      whileTap={interactive && !reduceMotion ? { scale: 0.99 } : undefined}
      transition={springSnappy}
      className={cn(
        "insight-card flex flex-col overflow-hidden rounded-[18px] border border-[var(--border-subtle)]",
        compact ? "min-h-[152px]" : "min-h-[168px]",
        interactive && "cursor-pointer hover:border-[var(--border-strong)]",
        className,
      )}
      style={{
        backgroundColor: "var(--bg-surface)",
        boxShadow: compact ? "none" : "0 1px 3px color-mix(in srgb, var(--text-primary) 4%, transparent)",
      }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? handleActivate : undefined}
      onKeyDown={interactive ? keyActivate : undefined}
    >
      <div className={cn("flex min-h-0 flex-1 flex-col p-4", compact && "p-3.5")}>
        <div className="mb-2.5 flex items-center justify-between gap-2 min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
              style={{ backgroundColor: config.bg, color: config.iconColor }}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span
              className="truncate text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              {typeLabel[insight.type] || "Analiz"}
            </span>
          </div>
          <span
            className="shrink-0 rounded-[6px] px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: config.bg, color: config.iconColor }}
          >
            {config.label}
          </span>
        </div>

        <h4
          className={cn(
            "font-bold leading-snug text-[var(--text-primary)]",
            compact ? "text-[14px] line-clamp-2" : "text-[15px] line-clamp-2",
          )}
        >
          {insight.title}
        </h4>

        <p
          className={cn(
            "mt-1 leading-[1.45] text-[var(--text-secondary)]",
            compact ? "text-[12px] line-clamp-2" : "text-[13px] line-clamp-3",
          )}
        >
          {insight.text}
        </p>

        {(showCtaRow || hasAmount) && (
          <div
            className={cn(
              "mt-auto flex min-h-[28px] items-end gap-2 pt-3",
              showCtaRow && hasAmount && "justify-between",
              !showCtaRow && hasAmount && "justify-end",
              showCtaRow && !hasAmount && "justify-end",
            )}
          >
            {hasAmount && insight.paymentAmountTry != null ? (
              <span
                className={cn(
                  "font-mono font-bold leading-none",
                  compact ? "text-[14px]" : "text-[15px]",
                  showCtaRow && "min-w-0",
                )}
                style={{ color: insight.severity === "warning" ? "var(--danger)" : "var(--text-primary)" }}
                aria-label={`Tahmini tutar ${formatExpenseHighlightTry(insight.paymentAmountTry)}`}
              >
                {formatExpenseHighlightTry(insight.paymentAmountTry)}
              </span>
            ) : null}
            {showCtaRow && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-bold shrink-0",
                  compact ? "text-[11px]" : "text-[12px]",
                  hasAmount && "max-w-[50%] truncate",
                )}
                style={{ color: "var(--accent-text)" }}
              >
                {ctaLabel}
                <ArrowRight className="h-3 w-3 shrink-0" />
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
