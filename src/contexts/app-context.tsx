"use client"

import * as React from "react"
import { mockTransactions as initialTransactions } from "@/lib/data"
import type { Transaction } from "@/lib/types"

type ToastState = { message: string } | null

interface AppContextValue {
  transactions: Transaction[]
  transactionsLoading: boolean
  addTransaction: (input: {
    merchant: string
    category: string
    amount: number
    source?: Transaction["source"]
    logoUrl?: string
    note?: string
  }) => Promise<Transaction>
  refreshTransactions: () => Promise<void>
  toast: ToastState
  showToast: (message: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

const AppContext = React.createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions)
  const [transactionsLoading, setTransactionsLoading] = React.useState(true)
  const [toast, setToast] = React.useState<ToastState>(null)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const toastTimerRef = React.useRef<number | null>(null)

  const showToast = React.useCallback((message: string) => {
    setToast({ message })
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const refreshTransactions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/transactions")
      if (!res.ok) return
      const data = (await res.json()) as { transactions: Transaction[] }
      if (Array.isArray(data.transactions) && data.transactions.length > 0) {
        setTransactions(data.transactions)
      }
    } catch {
      // keep mock fallback
    } finally {
      setTransactionsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refreshTransactions()
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    }
  }, [refreshTransactions])

  const addTransaction = React.useCallback(
    async (input: {
      merchant: string
      category: string
      amount: number
      source?: Transaction["source"]
      logoUrl?: string
      note?: string
    }) => {
      const optimistic: Transaction = {
        id: `txn_${Date.now()}`,
        merchant: input.merchant,
        category: input.category,
        amount: input.amount,
        currency: "TRY",
        date: new Date().toISOString(),
        source: input.source ?? "manual",
        logoUrl: input.logoUrl ?? "",
      }

      setTransactions((prev) => [optimistic, ...prev])

      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchant: input.merchant,
            category: input.category,
            amount: input.amount,
            source: input.source,
            logoUrl: input.logoUrl,
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as { transaction: Transaction }
          setTransactions((prev) => [
            data.transaction,
            ...prev.filter((t) => t.id !== optimistic.id),
          ])
          return data.transaction
        }
      } catch {
        // keep optimistic row
      }

      return optimistic
    },
    [],
  )

  const value = React.useMemo(
    () => ({
      transactions,
      transactionsLoading,
      addTransaction,
      refreshTransactions,
      toast,
      showToast,
      searchOpen,
      setSearchOpen,
    }),
    [
      transactions,
      transactionsLoading,
      addTransaction,
      refreshTransactions,
      toast,
      showToast,
      searchOpen,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
