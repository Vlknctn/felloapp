"use client"

import React from "react"
import { ChevronRight } from "lucide-react"
import { Transaction } from "@/lib/types"
import { getTransactionFallbackIcon, isTransactionLogoImage } from "@/lib/transaction-brand"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"

const sourceLabel: Record<string, string> = {
  gmail: "E-posta",
  bank: "Banka",
  manual: "Manuel",
}

export function TransactionItem({ transaction, onClick }: { transaction: Transaction; onClick?: (id: string) => void }) {
  const Icon = getTransactionFallbackIcon(transaction.logoUrl)
  const isExpense = transaction.amount < 0
  const showLogo = isTransactionLogoImage(transaction.logoUrl)

  return (
    <div 
      onClick={() => onClick?.(transaction.id)}
      className="list-item group cursor-pointer"
    >
      {/* Avatar */}
      <div className="list-item__avatar">
        {showLogo ? (
          <BrandLogoSlot src={transaction.logoUrl} alt={transaction.merchant} />
        ) : (
          <Icon className="w-[18px] h-[18px]" />
        )}
      </div>

      {/* Content */}
      <div className="list-item__content">
        <div className="list-item__title">{transaction.merchant}</div>
        <div className="list-item__subtitle">
          {transaction.category} · {sourceLabel[transaction.source]} · {new Date(transaction.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Value */}
      <div className="list-item__value" style={{ color: isExpense ? "var(--text-primary)" : "var(--accent-text)" }}>
        {isExpense ? "" : "+"}{transaction.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
      </div>

      {/* Accessory */}
      <ChevronRight className="list-item__accessory w-4 h-4" />
    </div>
  )
}
