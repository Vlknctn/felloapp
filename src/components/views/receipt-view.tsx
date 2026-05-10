"use client"

import * as React from "react"
import { mockTransactions } from "@/lib/data"
import { ChevronLeft, Wallet, Brain, Mail, Landmark, ArrowRight } from "lucide-react"
import { getTransactionFallbackIcon, isTransactionLogoImage } from "@/lib/transaction-brand"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"

export function ReceiptView({ transactionId, onBack }: { transactionId: string; onBack: () => void }) {
  const transaction = mockTransactions.find(t => t.id === transactionId) || mockTransactions[0]

  const Icon = getTransactionFallbackIcon(transaction.logoUrl)
  const showBrandLogo = isTransactionLogoImage(transaction.logoUrl)
  const SourceIcon = transaction.source === "gmail" ? Mail : (transaction.source === "bank" ? Landmark : Wallet)

  const formattedDate = new Date(transaction.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = new Date(transaction.date).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar" style={{ backgroundColor: "var(--bg-base)" }}>
      <header className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md"
              style={{ backgroundColor: "color-mix(in srgb, var(--bg-base) 90%, transparent)" }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>İşlem Detayı</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center pt-4 pb-12 px-4">
        <div className="w-full max-w-[340px] relative">
          <div className="w-full h-4"
            style={{
              backgroundImage: `radial-gradient(circle at 10px 0px, var(--bg-base) 9px, #FAFAFA 10px)`,
              backgroundSize: "20px 16px",
              backgroundRepeat: "repeat-x",
            }}
          />
          <div className="bg-[#FAFAFA] px-6 pt-4 pb-6 shadow-xl text-[#1A1A1A]">
            <div className="flex flex-col items-center mb-5">
              <div className="relative w-14 h-14 rounded-2xl border-2 border-[#E0E0E0] mb-3 bg-white overflow-hidden">
                {showBrandLogo ? (
                  <BrandLogoSlot
                    src={transaction.logoUrl}
                    alt={transaction.merchant}
                    className="absolute inset-0 brand-logo-slot--receipt"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#1A1A1A]" />
                  </span>
                )}
              </div>
              <h2 className="text-[20px] font-black uppercase tracking-widest text-center font-mono">{transaction.merchant}</h2>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F0F0F0] text-[#666]">
                {transaction.category}
              </span>
            </div>

            <div className="border-t-2 border-dashed border-[#D4D4D4] my-4" />

            <div className="flex flex-col gap-2.5 font-mono text-[13px] mb-4">
              {[
                { label: "TARİH", value: formattedDate },
                { label: "SAAT", value: formattedTime },
                { label: "İŞLEM NO", value: transaction.id.toUpperCase() },
                { label: "KAYNAK", value: transaction.source === "gmail" ? "E-Posta" : transaction.source === "bank" ? "Banka" : "Manuel", showIcon: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[#999] font-semibold tracking-wider text-[11px]">{row.label}</span>
                  <span className="text-[#1A1A1A] font-bold flex items-center gap-1">
                    {row.showIcon && <SourceIcon className="w-3.5 h-3.5" />}
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-[#D4D4D4] my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-[16px] font-black font-mono tracking-wider">TOPLAM</span>
              <span className="text-[26px] font-black font-mono tracking-tighter">
                {Math.abs(transaction.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                <span className="text-[16px] ml-1">TL</span>
              </span>
            </div>

            <div className="flex flex-col items-center opacity-60">
              <div className="flex gap-[2px] mb-1">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="bg-[#1A1A1A]" style={{ width: i % 3 === 0 ? "2.5px" : "1px", height: i % 7 === 0 ? "32px" : "24px" }} />
                ))}
              </div>
              <p className="text-[9px] tracking-[0.3em] text-[#999] font-mono mt-1">{transaction.id.toUpperCase()}</p>
            </div>
            <p className="text-[10px] text-[#BBB] uppercase tracking-widest text-center mt-4 font-mono">teşekkür ederiz · fello</p>
          </div>
          <div className="w-full h-4"
            style={{
              backgroundImage: `radial-gradient(circle at 10px 16px, var(--bg-base) 9px, #FAFAFA 10px)`,
              backgroundSize: "20px 16px",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 0",
            }}
          />
        </div>

        {/* ── Wise-style Summary ── */}
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
                {transaction.source === "gmail" ? "E-Posta" : transaction.source === "bank" ? "Banka" : "Manuel"}
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

        {/* ── Wise-style Nudge (AI Analysis) ── */}
        <div className="w-full max-w-[340px] mt-4 nudge" onClick={() => {}}>
          <div className="nudge__icon" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}>
            <Brain className="w-4 h-4" />
          </div>
          <div className="nudge__content">
            <h4 className="nudge__title">CogniMemo Analizi</h4>
            <p className="nudge__description">
              Bu ay bu markadan 4. alışverişin. Geçen aya göre bu kategorideki harcamaların şimdiden %20 arttı.
            </p>
          </div>
          <ArrowRight className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
        </div>
      </div>
    </div>
  )
}
