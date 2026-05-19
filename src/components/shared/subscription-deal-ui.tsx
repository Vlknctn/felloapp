"use client"

import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import { ArrowRight, CheckCircle } from "@/lib/icons"
import { getProviderLogo } from "@/lib/provider-logos"
import type { SubscriptionDealDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

export function formatDealTry(amount: number): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`
}

const CATEGORY_LABEL: Record<SubscriptionDealDetail["category"], string> = {
  mobile: "Mobil hat",
  streaming: "Streaming",
  productivity: "Yapay zeka",
}

export function dealCategoryLabel(category: SubscriptionDealDetail["category"]): string {
  return CATEGORY_LABEL[category]
}

export function providerInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function ProviderLogo({
  provider,
  logoUrl,
  variant = "neutral",
  size = "md",
}: {
  provider: string
  logoUrl?: string
  variant?: "neutral" | "current" | "recommended"
  size?: "sm" | "md"
}) {
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-11 w-11"
  const src = logoUrl ?? getProviderLogo(provider)
  const borderColor =
    variant === "recommended"
      ? "color-mix(in srgb, var(--accent) 45%, var(--border-subtle))"
      : "var(--border-subtle)"

  if (src) {
    return (
      <div
        className={cn(
          "sub-deal-provider-logo relative shrink-0 overflow-hidden rounded-[12px] border",
          sizeClass,
        )}
        style={{ backgroundColor: "var(--bg-elevated)", borderColor }}
      >
        <BrandLogoSlot
          src={src}
          alt={provider}
          className="absolute inset-0 brand-logo-slot--cell"
        />
      </div>
    )
  }

  const variantStyle =
    variant === "current"
      ? { backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }
      : variant === "recommended"
        ? { backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }
        : { backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[12px] border font-bold",
        sizeClass,
        size === "sm" ? "text-[11px]" : "text-[12px]",
      )}
      style={{ ...variantStyle, borderColor }}
      aria-hidden
    >
      {providerInitials(provider)}
    </div>
  )
}

export function SavingsPill({
  monthlySavingsTry,
  className,
}: {
  monthlySavingsTry: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums",
        className,
      )}
      style={{
        backgroundColor: "var(--positive-muted)",
        color: "var(--positive)",
      }}
    >
      −{formatDealTry(monthlySavingsTry)}/ay
    </span>
  )
}

export function CompareColumns({
  deal,
  compact,
}: {
  deal: SubscriptionDealDetail
  compact?: boolean
}) {
  return (
    <div className="sub-deal-compare">
      <div className="sub-deal-compare__col sub-deal-compare__col--current">
        <ProviderLogo
          provider={deal.current.provider}
          logoUrl={deal.current.logoUrl}
          variant="current"
          size={compact ? "sm" : "md"}
        />
        <div className="sub-deal-compare__meta min-w-0">
          <span className="sub-deal-compare__provider">{deal.current.provider}</span>
          <span className="sub-deal-compare__plan">{deal.current.planName}</span>
          <span className="sub-deal-compare__price sub-deal-compare__price--old">
            {formatDealTry(deal.current.monthlyPriceTry)}
          </span>
        </div>
      </div>

      <div className="sub-deal-compare__arrow" aria-hidden>
        <ArrowRight className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
      </div>

      <div className="sub-deal-compare__col sub-deal-compare__col--recommended">
        <ProviderLogo
          provider={deal.recommended.provider}
          logoUrl={deal.recommended.logoUrl}
          variant="recommended"
          size={compact ? "sm" : "md"}
        />
        <div className="sub-deal-compare__meta min-w-0">
          <span className="sub-deal-compare__provider">{deal.recommended.provider}</span>
          <span className="sub-deal-compare__plan">{deal.recommended.planName}</span>
          <span className="sub-deal-compare__price sub-deal-compare__price--new">
            {formatDealTry(deal.recommended.monthlyPriceTry)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function FeatureChips({ features, max = 3 }: { features: string[]; max?: number }) {
  if (features.length === 0) return null
  return (
    <ul className="sub-deal-features">
      {features.slice(0, max).map((f) => (
        <li key={f} className="sub-deal-features__chip">
          <CheckCircle className="h-3 w-3 shrink-0" style={{ color: "var(--accent-text)" }} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  )
}

export function FeatureCompareTable({ deal }: { deal: SubscriptionDealDetail }) {
  const allFeatures = [...new Set([...deal.current.features, ...deal.recommended.features])]
  const matched = new Set(deal.matchedFeatures)

  return (
    <div className="sub-deal-table">
      <div className="sub-deal-table__head">
        <span className="sub-deal-table__head-cell sub-deal-table__head-cell--feature">Özellik</span>
        <TableProviderHead
          provider={deal.current.provider}
          logoUrl={deal.current.logoUrl}
        />
        <TableProviderHead
          provider={deal.recommended.provider}
          logoUrl={deal.recommended.logoUrl}
          highlight
        />
      </div>
      <ul className="sub-deal-table__body">
        {allFeatures.map((feature) => {
          const inCurrent = deal.current.features.includes(feature)
          const inRecommended = deal.recommended.features.includes(feature)
          const isMatched = matched.has(feature)
          return (
            <li key={feature} className="sub-deal-table__row">
              <span
                className={cn(
                  "sub-deal-table__feature",
                  isMatched && "sub-deal-table__feature--matched",
                )}
              >
                {feature}
              </span>
              <CellMark included={inCurrent} />
              <CellMark included={inRecommended} highlight />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TableProviderHead({
  provider,
  logoUrl,
  highlight,
}: {
  provider: string
  logoUrl?: string
  highlight?: boolean
}) {
  return (
    <span
      className={cn(
        "sub-deal-table__head-cell sub-deal-table__head-provider",
        highlight && "sub-deal-table__head-cell--highlight",
      )}
    >
      <ProviderLogo provider={provider} logoUrl={logoUrl} size="sm" variant={highlight ? "recommended" : "current"} />
      <span className="sub-deal-table__head-provider-name">{provider}</span>
    </span>
  )
}

function CellMark({ included, highlight }: { included: boolean; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "sub-deal-table__mark",
        included && "sub-deal-table__mark--yes",
        highlight && included && "sub-deal-table__mark--highlight",
      )}
    >
      {included ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <span className="sub-deal-table__dash">—</span>
      )}
    </span>
  )
}
