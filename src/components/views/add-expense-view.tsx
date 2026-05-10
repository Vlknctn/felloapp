"use client"

import * as React from "react"
import { ChevronLeft, Coffee, ShoppingCart, Utensils, Car, Music, CreditCard } from "lucide-react"

const categories = [
  { id: "coffee", icon: Coffee, label: "Kahve" },
  { id: "market", icon: ShoppingCart, label: "Market" },
  { id: "food", icon: Utensils, label: "Yemek" },
  { id: "transport", icon: Car, label: "Ulaşım" },
  { id: "subscription", icon: Music, label: "Abonelik" },
  { id: "other", icon: CreditCard, label: "Diğer" },
]

export function AddExpenseView({ onBack }: { onBack: () => void }) {
  const [amount, setAmount] = React.useState("0")
  const [selectedCategory, setSelectedCategory] = React.useState("coffee")
  const [note, setNote] = React.useState("")

  const handleNumpad = (num: string) => {
    if (num === "." && amount.includes(".")) return
    if (amount === "0" && num !== ".") setAmount(num)
    else {
      if (amount.includes(".") && amount.split(".")[1].length >= 2) return
      setAmount(prev => prev + num)
    }
  }

  const handleDelete = () => setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : "0")

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg-base)" }}>
      <header className="px-4 pt-4 pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>Harcama Ekle</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <p className="section-header !p-0 mb-4">Tutar</p>
        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="text-[52px] font-mono font-bold leading-none tracking-tighter" style={{ color: "var(--text-primary)" }}>
            {amount}
          </h2>
          <span className="text-[26px] font-mono" style={{ color: "var(--text-disabled)" }}>₺</span>
        </div>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Not ekle (opsiyonel)"
          className="mt-3 text-center bg-transparent text-[14px] focus:outline-none pb-1 w-full max-w-[240px]"
          style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}
        />
      </div>

      <div className="px-4 mb-4">
        <p className="section-header !p-0 mb-3">Kategori</p>
        <div className="grid grid-cols-6 gap-2">
          {categories.map((cat) => {
            const CatIcon = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-[14px] transition-all cursor-pointer"
                style={{
                  backgroundColor: isSelected ? "var(--accent-muted)" : "var(--bg-surface)",
                  border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border-subtle)"}`,
                  color: isSelected ? "var(--accent-text)" : "var(--text-tertiary)",
                }}
              >
                <CatIcon className="w-5 h-5" />
                <span className="text-[9px] font-semibold">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-t-[24px] px-5 pt-5 pb-8" style={{ backgroundColor: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="grid grid-cols-3 gap-y-1 mb-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumpad(num)}
              className="h-14 flex items-center justify-center text-[24px] font-mono font-semibold rounded-[14px] active:opacity-60 transition-opacity cursor-pointer"
              style={{ color: "var(--text-primary)" }}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-14 flex items-center justify-center text-[16px] font-semibold rounded-[14px] active:opacity-60 transition-opacity cursor-pointer"
            style={{ color: "var(--danger)" }}
          >
            Sil
          </button>
        </div>

        <button
          onClick={onBack}
          className="flex items-center justify-center w-full h-14 rounded-[16px] font-semibold text-[16px] transition-all active:scale-[0.98] cursor-pointer"
          style={{
            backgroundColor: amount !== "0" ? "var(--accent)" : "var(--bg-elevated)",
            color: amount !== "0" ? "var(--on-accent)" : "var(--text-disabled)",
            boxShadow: amount !== "0" ? "0 4px 16px color-mix(in srgb, var(--accent) 38%, transparent)" : "none",
          }}
        >
          Kaydet
        </button>
      </div>
    </div>
  )
}
