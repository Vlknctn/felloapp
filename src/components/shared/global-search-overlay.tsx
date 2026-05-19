"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Search, X } from "@/lib/icons"
import { useApp } from "@/contexts/app-context"
import { TransactionItem } from "@/components/shared/transaction-item"

export function GlobalSearchOverlay({
  onTransactionClick,
}: {
  onTransactionClick?: (id: string) => void
}) {
  const { searchOpen, setSearchOpen, transactions } = useApp()
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [appShell, setAppShell] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setAppShell(document.getElementById("fello-app-shell"))
  }, [])

  React.useEffect(() => {
    if (!searchOpen) {
      setQuery("")
      return
    }
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [searchOpen])

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return transactions.slice(0, 8)
    return transactions.filter(
      (tx) =>
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
    )
  }, [query, transactions])

  const close = () => setSearchOpen(false)

  const handleSelect = (id: string) => {
    close()
    onTransactionClick?.(id)
  }

  if (!searchOpen || !appShell) return null

  return createPortal(
    <>
      <button
        type="button"
        className="absolute inset-0 z-[70] bg-black/40 backdrop-blur-[2px] border-0"
        aria-label="Aramayı kapat"
        onClick={close}
      />
      <div
        className="absolute left-3 right-3 top-[72px] z-[72] flex flex-col rounded-[20px] overflow-hidden shadow-2xl max-h-[min(520px,calc(100%-120px))]"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
      >
        <div
          className="flex items-center gap-2 px-3 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Marka, kategori veya işlem no ara..."
            className="flex-1 bg-transparent text-[15px] outline-none min-w-0"
            style={{ color: "var(--text-primary)" }}
            aria-labelledby="global-search-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") close()
            }}
          />
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 id="global-search-title" className="sr-only">
          Harcama ara
        </h2>
        <div className="overflow-y-auto no-scrollbar flex-1 px-2 py-2">
          {results.length === 0 ? (
            <p className="text-[14px] text-center py-10" style={{ color: "var(--text-tertiary)" }}>
              Sonuç bulunamadı
            </p>
          ) : (
            <>
              {!query.trim() && (
                <p className="section-header !px-2 !pt-1 !pb-2">Son işlemler</p>
              )}
              {results.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onClick={() => handleSelect(tx.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>,
    appShell
  )
}
