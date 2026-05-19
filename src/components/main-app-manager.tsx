"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { BottomNav } from "@/components/ui/bottom-nav"
import { HomeView } from "@/components/views/home-view"
import { ExpensesView } from "@/components/views/expenses-view"
import { InsightsView } from "@/components/views/insights-view"
import { ProfileView } from "@/components/views/profile-view"
import {
  ProfileSettingsView,
  type ProfileSettingsSection,
} from "@/components/views/profile-settings-view"
import { AddExpenseView } from "@/components/views/add-expense-view"
import { ReceiptView } from "@/components/views/receipt-view"
import { MemoryChatOverlay } from "@/components/shared/memory-chat-overlay"
import { GlobalSearchOverlay } from "@/components/shared/global-search-overlay"
import { BillCreepSheet } from "@/components/shared/bill-creep-sheet"
import { SubscriptionDealSheet } from "@/components/shared/subscription-deal-sheet"
import { Toast } from "@/components/ui/toast"
import { AnimatedPage } from "@/components/shared/animated-presence"
import { useApp } from "@/contexts/app-context"
import type { BillCreepDetail, SubscriptionDealDetail } from "@/lib/types"

type TabId = "home" | "expenses" | "insights" | "profile"

const TAB_PATHS: Record<TabId, string> = {
  home: "/",
  expenses: "/expenses",
  insights: "/insights",
  profile: "/profile",
}

const PROFILE_SETTINGS_SECTIONS = new Set<ProfileSettingsSection>([
  "bank",
  "notifications",
  "privacy",
])

function parseRoute(pathname: string): {
  view: "tabs" | "add" | "receipt" | "profile-settings"
  tab: TabId
  transactionId?: string
  profileSection?: ProfileSettingsSection
} {
  if (pathname === "/add") return { view: "add", tab: "home" }
  const receiptMatch = pathname.match(/^\/expenses\/([^/]+)$/)
  if (receiptMatch) {
    return { view: "receipt", tab: "expenses", transactionId: receiptMatch[1] }
  }
  const profileSettingsMatch = pathname.match(/^\/profile\/([^/]+)$/)
  if (
    profileSettingsMatch &&
    PROFILE_SETTINGS_SECTIONS.has(profileSettingsMatch[1] as ProfileSettingsSection)
  ) {
    return {
      view: "profile-settings",
      tab: "profile",
      profileSection: profileSettingsMatch[1] as ProfileSettingsSection,
    }
  }
  if (pathname === "/expenses") return { view: "tabs", tab: "expenses" }
  if (pathname === "/insights") return { view: "tabs", tab: "insights" }
  if (pathname === "/profile") return { view: "tabs", tab: "profile" }
  return { view: "tabs", tab: "home" }
}

export function MainAppManager() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast, setSearchOpen, showToast } = useApp()
  const [assistantOpen, setAssistantOpen] = React.useState(false)
  const [billCreepOpen, setBillCreepOpen] = React.useState(false)
  const [billCreepDetail, setBillCreepDetail] = React.useState<BillCreepDetail | null>(null)
  const [subDealOpen, setSubDealOpen] = React.useState(false)
  const [subDealDetail, setSubDealDetail] = React.useState<SubscriptionDealDetail | null>(null)

  const openBillCreep = React.useCallback((detail: BillCreepDetail) => {
    setBillCreepDetail(detail)
    setBillCreepOpen(true)
  }, [])

  const closeBillCreep = React.useCallback(() => {
    setBillCreepOpen(false)
    setBillCreepDetail(null)
  }, [])

  const openSubscriptionDeal = React.useCallback((detail: SubscriptionDealDetail) => {
    setSubDealDetail(detail)
    setSubDealOpen(true)
  }, [])

  const closeSubscriptionDeal = React.useCallback(() => {
    setSubDealOpen(false)
    setSubDealDetail(null)
  }, [])

  const route = React.useMemo(() => parseRoute(pathname), [pathname])

  const navigateToTab = (tab: string) => {
    const tabId = tab as TabId
    router.push(TAB_PATHS[tabId] ?? "/")
  }

  const navigateToReceipt = (id: string) => {
    router.push(`/expenses/${id}`)
  }

  const navigateToAdd = () => {
    router.push("/add")
  }

  const goBack = () => {
    if (route.view === "add") {
      router.push("/")
      return
    }
    if (route.view === "receipt") {
      router.push("/expenses")
      return
    }
    if (route.view === "profile-settings") {
      router.push("/profile")
    }
  }

  const navigateToProfileSettings = (section: ProfileSettingsSection) => {
    router.push(`/profile/${section}`)
  }

  const renderContent = () => {
    if (route.view === "add") {
      return <AddExpenseView onBack={goBack} />
    }
    if (route.view === "receipt" && route.transactionId) {
      return <ReceiptView transactionId={route.transactionId} onBack={goBack} />
    }
    if (route.view === "profile-settings" && route.profileSection) {
      return <ProfileSettingsView section={route.profileSection} onBack={goBack} />
    }

    switch (route.tab) {
      case "home":
        return (
          <HomeView
            onNavigate={navigateToTab}
            onTransactionClick={navigateToReceipt}
            onAddClick={navigateToAdd}
            onSearchClick={() => setSearchOpen(true)}
            onBillCreepOpen={openBillCreep}
            onSubscriptionDealOpen={openSubscriptionDeal}
          />
        )
      case "expenses":
        return (
          <ExpensesView
            onTransactionClick={navigateToReceipt}
            onAddClick={navigateToAdd}
          />
        )
      case "insights":
        return (
          <InsightsView
            onNavigate={navigateToTab}
            onTransactionClick={navigateToReceipt}
            onBillCreepOpen={openBillCreep}
            onSubscriptionDealOpen={openSubscriptionDeal}
          />
        )
      case "profile":
        return <ProfileView onSettingsClick={navigateToProfileSettings} />
      default:
        return (
          <HomeView
            onNavigate={navigateToTab}
            onTransactionClick={navigateToReceipt}
            onAddClick={navigateToAdd}
            onSearchClick={() => setSearchOpen(true)}
            onBillCreepOpen={openBillCreep}
            onSubscriptionDealOpen={openSubscriptionDeal}
          />
        )
    }
  }

  const showBottomNav = route.view === "tabs"

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatedPage
          pageKey={`${route.view}-${route.tab}-${route.transactionId ?? ""}-${route.profileSection ?? ""}`}
        >
          {renderContent()}
        </AnimatedPage>
      </div>
      {showBottomNav && (
        <BottomNav
          activeTab={route.tab}
          onTabChange={navigateToTab}
          onAssistantClick={() => setAssistantOpen(true)}
        />
      )}
      <GlobalSearchOverlay onTransactionClick={navigateToReceipt} />
      <MemoryChatOverlay open={assistantOpen} onOpenChange={setAssistantOpen} />
      <BillCreepSheet
        open={billCreepOpen}
        detail={billCreepDetail}
        onClose={closeBillCreep}
        onCopied={() => showToast("Görüşme metni kopyalandı")}
      />
      <SubscriptionDealSheet
        open={subDealOpen}
        detail={subDealDetail}
        onClose={closeSubscriptionDeal}
        onCopied={() => showToast("Paket özeti kopyalandı")}
      />
      {toast && <Toast message={toast.message} />}
    </div>
  )
}
