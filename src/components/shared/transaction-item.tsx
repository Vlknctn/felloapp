"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronRight } from "@/lib/icons"
import { Transaction } from "@/lib/types"
import { getTransactionFallbackIcon, isTransactionLogoImage } from "@/lib/transaction-brand"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import { fadeInUp, springSnappy } from "@/lib/motion"

const sourceLabel: Record<string, string> = {
  gmail: "E-posta",
  bank: "Banka",
  manual: "Manuel",
}

export function TransactionItem({
  transaction,
  onClick,
  index = 0,
}: {
  transaction: Transaction
  onClick?: (id: string) => void
  index?: number
}) {
  const reduceMotion = useReducedMotion()
  const Icon = getTransactionFallbackIcon(transaction.logoUrl)
  const isExpense = transaction.amount < 0
  const showLogo = isTransactionLogoImage(transaction.logoUrl)

  return (
    <motion.div
      variants={fadeInUp}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={{ ...springSnappy, delay: Math.min(index * 0.04, 0.24) }}
      whileTap={onClick && !reduceMotion ? { scale: 0.985 } : undefined}
      onClick={() => onClick?.(transaction.id)}
      className="list-item group cursor-pointer"
    >
      <div className="list-item__avatar">
        {showLogo ? (
          <BrandLogoSlot src={transaction.logoUrl} alt={transaction.merchant} />
        ) : (
          <Icon className="w-[18px] h-[18px]" />
        )}
      </div>

      <div className="list-item__content">
        <div className="list-item__title">{transaction.merchant}</div>
        <div className="list-item__subtitle">
          {transaction.category} · {sourceLabel[transaction.source]} ·{" "}
          {new Date(transaction.date).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div
        className="list-item__value"
        style={{ color: isExpense ? "var(--text-primary)" : "var(--accent-text)" }}
      >
        {isExpense ? "" : "+"}
        {transaction.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
      </div>

      <ChevronRight className="list-item__accessory w-4 h-4" />
    </motion.div>
  )
}
