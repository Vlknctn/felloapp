"use client"

import type { SubscriptionDealDetail } from "@/lib/types"
import {
  CompareColumns,
  dealCategoryLabel,
  FeatureChips,
  SavingsPill,
} from "@/components/shared/subscription-deal-ui"

export function SubscriptionDealCarousel({
  deals,
  onSelect,
}: {
  deals: SubscriptionDealDetail[]
  onSelect: (deal: SubscriptionDealDetail) => void
}) {
  if (deals.length === 0) return null

  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
        {deals.map((deal) => (
          <button
            key={`${deal.current.provider}-${deal.recommended.provider}`}
            type="button"
            onClick={() => onSelect(deal)}
            className="sub-deal-card snap-start shrink-0 w-[min(92vw,320px)] text-left active:scale-[0.99] transition-transform"
          >
            <div className="sub-deal-card__header">
              <span className="sub-deal-card__category">{dealCategoryLabel(deal.category)}</span>
              <SavingsPill monthlySavingsTry={deal.monthlySavingsTry} />
            </div>

            <CompareColumns deal={deal} compact />

            <FeatureChips features={deal.matchedFeatures} max={2} />

            <span className="sub-deal-card__cta">Karşılaştırmayı aç</span>
          </button>
        ))}
      </div>
    </div>
  )
}
