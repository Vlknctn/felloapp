"use client"

import * as React from "react"
import { BottomNav } from "@/components/ui/bottom-nav"
import { HomeView } from "@/components/views/home-view"
import { ExpensesView } from "@/components/views/expenses-view"
import { InsightsView } from "@/components/views/insights-view"
import { ProfileView } from "@/components/views/profile-view"
import { AddExpenseView } from "@/components/views/add-expense-view"
import { ReceiptView } from "@/components/views/receipt-view"
import { mockTransactions } from "@/lib/data"

export function MainAppManager() {
  const [activeTab, setActiveTab] = React.useState("home")
  const [view, setView] = React.useState("tabs")
  const [params, setParams] = React.useState<{ id?: string } | null>(null)

  const navigateToTab = (tab: string) => {
    setActiveTab(tab)
    setView("tabs")
  }

  const navigateToReceipt = (id: string) => {
    setParams({ id })
    setView("receipt")
  }

  const navigateToAdd = () => {
    setView("add")
  }

  const goBack = () => {
    if (view === "add" || view === "receipt") {
      setView("tabs")
    }
  }

  const renderContent = () => {
    if (view === "add") {
      return <AddExpenseView onBack={goBack} />
    }
    if (view === "receipt") {
      return <ReceiptView transactionId={params?.id ?? mockTransactions[0]?.id ?? ""} onBack={goBack} />
    }

    switch (activeTab) {
      case "home":
        return <HomeView onNavigate={navigateToTab} onTransactionClick={navigateToReceipt} onAddClick={navigateToAdd} />
      case "expenses":
        return <ExpensesView onTransactionClick={navigateToReceipt} />
      case "insights":
        return <InsightsView />
      case "profile":
        return <ProfileView />
      default:
        return <HomeView onNavigate={navigateToTab} />
    }
  }

  const showBottomNav = view === "tabs"

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </div>
      {showBottomNav && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={navigateToTab} 
          onAddClick={navigateToAdd}
        />
      )}
    </div>
  )
}
