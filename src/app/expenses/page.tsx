"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { mockTransactions } from "@/lib/data"
import { Transaction } from "@/lib/types"
import { TransactionItem } from "@/components/shared/transaction-item"
import { Filter, Search, Receipt } from "lucide-react"

type Period = "all" | "today" | "week" | "month"

const periodLabels: Record<Period, string> = {
  all: "Tümü",
  today: "Bugün",
  week: "Hafta",
  month: "Ay",
}

function groupByDay(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  transactions.forEach((tx) => {
    const d = new Date(tx.date)
    let label: string
    if (d.toDateString() === today.toDateString()) label = "Bugün"
    else if (d.toDateString() === yesterday.toDateString()) label = "Dün"
    else label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })
    if (!groups[label]) groups[label] = []
    groups[label].push(tx)
  })
  return groups
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="list-item__avatar w-16 h-16 rounded-[20px] mb-4">
        <Receipt className="w-7 h-7" />
      </div>
      <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Harcama bulunamadı</p>
      <p className="text-[14px] text-center" style={{ color: "var(--text-tertiary)" }}>Bu dönemde harcama kaydı yok.</p>
    </div>
  )
}

function ExpensesContent() {
  const searchParams = useSearchParams()
  const period = (searchParams.get("period") || "all") as Period
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    const now = new Date()
    return mockTransactions.filter((tx) => {
      const d = new Date(tx.date)
      const matchSearch = search === "" || tx.merchant.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false
      if (period === "today") return d.toDateString() === now.toDateString()
      if (period === "week") { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w }
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
  }, [period, search])

  const grouped = groupByDay(filtered)
  const groupKeys = Object.keys(grouped)

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "var(--bg-base)" }}>

      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md"
              style={{ backgroundColor: "color-mix(in srgb, var(--bg-base) 90%, transparent)" }}>
        <h1 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>Harcamalar</h1>
        <button
          className="w-10 h-10 rounded-[14px] flex items-center justify-center relative active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
        >
          <Filter className="w-[16px] h-[16px]" />
          {period !== "all" && <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />}
        </button>
      </header>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Marka veya kategori ara..."
            className="fello-input h-[46px] pl-10 pr-4"
          />
        </div>
      </div>

      {/* Wise Chip Filter Row */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {(["all", "today", "week", "month"] as Period[]).map((p) => (
          <a key={p} href={p === "all" ? "/expenses" : `/expenses?period=${p}`}
             className={`chip ${period === p ? "chip--active" : ""}`}>
            {periodLabels[p]}
          </a>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 flex-1">
        {groupKeys.length === 0 ? (
          <EmptyState />
        ) : (
          groupKeys.map((day) => (
            <div key={day} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="section-header !p-0">{day}</p>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-subtle)" }} />
                <p className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>
                  {grouped[day].reduce((s, t) => s + t.amount, 0).toLocaleString("tr-TR", { minimumFractionDigits: 0 })} ₺
                </p>
              </div>
              {grouped[day].map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Expenses() {
  return (
    <React.Suspense fallback={<div className="min-h-full" style={{ backgroundColor: "var(--bg-base)" }} />}>
      <ExpensesContent />
    </React.Suspense>
  )
}
