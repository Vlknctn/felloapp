"use client"

import * as React from "react"
import { ChevronLeft, Wallet, Brain, Mail, Landmark } from "@/lib/icons"
import { getTransactionFallbackIcon, isTransactionLogoImage } from "@/lib/transaction-brand"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import { useApp } from "@/contexts/app-context"
import { generateTransactionAnalysis } from "@/lib/cognimemo-analysis"
import { formatTry } from "@/lib/format-currency"

export function ReceiptView({ transactionId, onBack }: { transactionId: string; onBack: () => void }) {
  const { transactions } = useApp()
  const transaction = transactions.find((t) => t.id === transactionId) ?? transactions[0]

  const analysis = React.useMemo(
    () => generateTransactionAnalysis(transaction, transactions),
    [transaction, transactions]
  )

  const Icon = getTransactionFallbackIcon(transaction.logoUrl)
  const showBrandLogo = isTransactionLogoImage(transaction.logoUrl)
  const SourceIcon =
    transaction.source === "gmail" ? Mail : transaction.source === "bank" ? Landmark : Wallet

  const formattedDate = new Date(transaction.date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = new Date(transaction.date).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className="flex flex-col h-full overflow-y-auto no-scrollbar"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <header
        className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md"
        style={{ backgroundColor: "color-mix(in srgb, var(--bg-base) 90%, transparent)" }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>
          İşlem Detayı
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center pt-4 pb-12 px-4">
        <div className="w-full max-w-[340px] relative receipt-shell">
          <div className="receipt-notch receipt-notch--top" />
          <div className="receipt-paper px-6 pt-4 pb-6">
            <div className="flex flex-col items-center mb-5">
              <div className="receipt-logo-slot relative w-14 h-14 rounded-2xl mb-3 overflow-hidden">
                {showBrandLogo ? (
                  <BrandLogoSlot
                    src={transaction.logoUrl}
                    alt={transaction.merchant}
                    className="absolute inset-0 brand-logo-slot--receipt"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6 receipt-text" />
                  </span>
                )}
              </div>
              <h2 className="text-[20px] font-black uppercase tracking-widest text-center font-mono receipt-text">
                {transaction.merchant}
              </h2>
              <span className="receipt-category-badge mt-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                {transaction.category}
              </span>
            </div>

            <div className="receipt-divider my-4" />

            <div className="flex flex-col gap-2.5 font-mono text-[13px] mb-4">
              {[
                { label: "TARİH", value: formattedDate },
                { label: "SAAT", value: formattedTime },
                { label: "İŞLEM NO", value: transaction.id.toUpperCase() },
                {
                  label: "KAYNAK",
                  value:
                    transaction.source === "gmail"
                      ? "E-Posta"
                      : transaction.source === "bank"
                        ? "Banka"
                        : "Manuel",
                  showIcon: true,
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="receipt-label text-[11px] font-semibold tracking-wider">
                    {row.label}
                  </span>
                  <span className="receipt-text font-bold flex items-center gap-1">
                    {row.showIcon && <SourceIcon className="w-3.5 h-3.5" />}
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="receipt-divider my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-[16px] font-black font-mono tracking-wider receipt-text">
                TOPLAM
              </span>
              <span className="text-[26px] font-black font-mono tracking-tighter receipt-text">
                {formatTry(transaction.amount, { absolute: true })}
              </span>
            </div>

            <div className="flex flex-col items-center opacity-60">
              <div className="flex gap-[2px] mb-1">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="receipt-barcode"
                    style={{
                      width: i % 3 === 0 ? "2.5px" : "1px",
                      height: i % 7 === 0 ? "32px" : "24px",
                    }}
                  />
                ))}
              </div>
              <p className="receipt-muted text-[9px] tracking-[0.3em] font-mono mt-1">
                {transaction.id.toUpperCase()}
              </p>
            </div>
            <p className="receipt-footer text-[10px] uppercase tracking-widest text-center mt-4 font-mono">
              teşekkür ederiz · fello
            </p>
          </div>
          <div className="receipt-notch receipt-notch--bottom" />
        </div>

        <div className="w-full max-w-[340px] mt-8">
          <p className="section-header !p-0 mb-3">İşlem Özeti</p>
          <div className="summary-group">
            <div className="summary-item">
              <span className="summary-item__label">Kategori</span>
              <span className="summary-item__value">{transaction.category}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item__label">Ödeme Kaynağı</span>
              <span className="summary-item__value flex items-center gap-2 justify-end">
                <SourceIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                {transaction.source === "gmail"
                  ? "E-Posta"
                  : transaction.source === "bank"
                    ? "Banka"
                    : "Manuel"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-item__label">Durum</span>
              <span className="summary-item__value summary-item__value--highlight">Tamamlandı</span>
            </div>
            <div className="summary-item">
              <span className="summary-item__label">Harcama Tarihi</span>
              <span className="summary-item__value">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[340px] mt-4 nudge">
          <div
            className="nudge__icon"
            style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}
          >
            <Brain className="w-4 h-4" />
          </div>
          <div className="nudge__content">
            <h4 className="nudge__title">CogniMemo Analizi</h4>
            <p className="nudge__description">{analysis}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
