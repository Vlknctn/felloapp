"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { mockInsights, mockSubscriptions, mockSystemMessages } from "@/lib/data"
import { detectSubscriptionDeals, mergeAllInsights } from "@/lib/subscription-deals"
import type { MarketPackage } from "@/lib/market-packages"
import { FALLBACK_MARKET_PACKAGES } from "@/lib/market-packages"
import { useApp } from "@/contexts/app-context"
import type { BillCreepDetail, SubscriptionDealDetail } from "@/lib/types"
import { SubscriptionDealCarousel } from "@/components/shared/subscription-deal-carousel"
import { InsightCard } from "@/components/shared/insight-card"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import { Search, Send, ChevronRight, Mic, X } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { InsightNavTab } from "@/lib/types"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  createInitialChatMessages,
  SUGGESTED_QUESTIONS,
  type ChatMessage,
} from "@/lib/memory-chat"
import { useAgentChatSubmit } from "@/lib/use-agent-chat"
import { scaleIn, springSoft } from "@/lib/motion"
import { MemoryChatMessages } from "@/components/shared/memory-chat-messages"
import {
  getSpeechRecognitionCtor,
  useSpeechRecognitionAvailable,
} from "@/hooks/use-speech-recognition"

const typewritingTexts = [...SUGGESTED_QUESTIONS.slice(0, 4), "Harcamalarını sor..."]

const CHART_DATA = [
  { label: "Market", pct: 42, color: "var(--accent)" },
  { label: "Ulaşım", pct: 28, color: "var(--accent-text)" },
  { label: "Kahve", pct: 18, color: "var(--warning)" },
  { label: "Abonelik", pct: 12, color: "var(--text-tertiary)" },
]

type MemoryTab = "ozet" | "abonelikler" | "analizler"

const memoryTabLabels: Record<MemoryTab, string> = {
  ozet: "Özet",
  abonelikler: "Abonelikler",
  analizler: "Analizler",
}

function DonutChart() {
  const gradient = CHART_DATA.reduce(
    (acc, d, i) => {
      const start = CHART_DATA.slice(0, i).reduce((s, x) => s + x.pct, 0)
      const end = start + d.pct
      acc.push(`${d.color} ${start}% ${end}%`)
      return acc
    },
    [] as string[]
  ).join(", ")

  return (
    <div className="wise-card p-5">
      <p className="section-header !p-0 mb-4">Dönemsel Özet</p>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <div
            className="w-24 h-24 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex flex-col items-center justify-center"
              style={{ backgroundColor: "var(--bg-surface)" }}
            >
              <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                Mayıs
              </span>
              <span className="text-[13px] font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                8,4K ₺
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          {CHART_DATA.map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  {d.label}
                </span>
              </div>
              <span className="text-[12px] font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function InsightsView({
  onNavigate,
  onTransactionClick,
  onBillCreepOpen,
  onSubscriptionDealOpen,
}: {
  onNavigate?: (tab: InsightNavTab) => void
  onTransactionClick?: (id: string) => void
  onBillCreepOpen?: (detail: BillCreepDetail) => void
  onSubscriptionDealOpen?: (detail: SubscriptionDealDetail) => void
}) {
  const { transactions } = useApp()
  const [apiInsights, setApiInsights] = React.useState<ReturnType<typeof mergeAllInsights> | null>(null)
  const [marketPackages, setMarketPackages] = React.useState<MarketPackage[] | null>(null)

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/insights")
        if (!res.ok) return
        const data = (await res.json()) as {
          insights: ReturnType<typeof mergeAllInsights>
          packages?: MarketPackage[]
        }
        if (cancelled) return
        if (Array.isArray(data.insights)) setApiInsights(data.insights)
        if (Array.isArray(data.packages)) setMarketPackages(data.packages)
      } catch {
        // client merge fallback
      }
    })()
    return () => {
      cancelled = true
    }
  }, [transactions])

  const catalog = marketPackages ?? FALLBACK_MARKET_PACKAGES

  const allInsights = React.useMemo(
    () => apiInsights ?? mergeAllInsights(mockInsights, transactions, catalog),
    [apiInsights, transactions, catalog],
  )
  const subscriptionDeals = React.useMemo(
    () => detectSubscriptionDeals(transactions, catalog),
    [transactions, catalog],
  )
  const billCreepInsights = React.useMemo(
    () => allInsights.filter((i) => i.billCreep),
    [allInsights],
  )
  const [activeTab, setActiveTab] = React.useState<MemoryTab>("ozet")
  const [placeholderText, setPlaceholderText] = React.useState("")
  const [textIndex, setTextIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [chatOpen, setChatOpen] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [listening, setListening] = React.useState(false)
  const reduceMotion = useReducedMotion()
  const speechAvailable = useSpeechRecognitionAvailable()
  const { submit: submitAgent, cancel: cancelAgent } = useAgentChatSubmit()
  const assistantIdRef = React.useRef<string | null>(null)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const chatScrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const openChat = React.useCallback(() => {
    setChatOpen(true)
    setChatMessages((prev) =>
      prev.length > 0 ? prev : createInitialChatMessages(transactions),
    )
  }, [transactions])

  React.useEffect(() => {
    const currentText = typewritingTexts[textIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholderText(currentText.substring(0, placeholderText.length + 1))
        if (placeholderText === currentText) setTimeout(() => setIsDeleting(true), 2000)
      } else {
        setPlaceholderText(currentText.substring(0, placeholderText.length - 1))
        if (placeholderText === "") {
          setIsDeleting(false)
          setTextIndex((p) => (p + 1) % typewritingTexts.length)
        }
      }
    }, isDeleting ? 45 : 90)
    return () => clearTimeout(timeout)
  }, [placeholderText, isDeleting, textIndex])

  React.useEffect(() => {
    if (!chatOpen || !chatScrollRef.current) return
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }, [chatMessages, isTyping, chatOpen])

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      cancelAgent()
    }
  }, [cancelAgent])

  const submitQuestion = React.useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return
      openChat()
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed }
      const assistantId = `a-${Date.now()}`
      assistantIdRef.current = assistantId
      setChatMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", text: "" },
      ])
      setChatInput("")
      setIsTyping(true)

      void submitAgent(
        trimmed,
        chatMessages,
        (partial) => {
          setChatMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: partial } : m)),
          )
        },
        (finalText) => {
          setChatMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
          )
          setIsTyping(false)
          assistantIdRef.current = null
        },
        (err) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, text: `Şu an yanıt veremiyorum (${err}). Lütfen tekrar dene.` }
                : m,
            ),
          )
          setIsTyping(false)
          assistantIdRef.current = null
        },
      )
    },
    [isTyping, openChat, chatMessages, submitAgent],
  )

  const sendChat = React.useCallback(() => {
    submitQuestion(chatInput)
  }, [chatInput, submitQuestion])

  const startVoice = React.useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    openChat()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    const rec = new Ctor()
    rec.lang = "tr-TR"
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }
    rec.onerror = () => {
      setListening(false)
      recognitionRef.current = null
    }
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join("")
        .trim()
      if (transcript) submitQuestion(transcript)
    }
    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      setListening(false)
      recognitionRef.current = null
    }
  }, [openChat, submitQuestion])

  const composer = () => (
    <div className="relative flex items-center gap-2">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "var(--text-tertiary)" }}
      />
      <input
        ref={inputRef}
        type="text"
        value={chatInput}
        onChange={(e) => {
          openChat()
          setChatInput(e.target.value)
        }}
        onFocus={openChat}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            sendChat()
          }
        }}
        className="fello-input h-[50px] pl-10 pr-[88px] flex-1 min-w-0"
        placeholder={placeholderText}
        aria-label="Fello AI sohbetinde ara"
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          startVoice()
        }}
        disabled={!speechAvailable}
        className="absolute right-[46px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-[10px] flex items-center justify-center active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: listening ? "var(--accent-muted)" : "var(--bg-elevated)",
          color: listening ? "var(--accent-text)" : "var(--text-secondary)",
        }}
        aria-label="Sesle yaz"
        title={speechAvailable ? "Sesle yaz" : "Tarayıcı ses girişini desteklemiyor"}
      >
        <Mic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          sendChat()
        }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[10px] flex items-center justify-center active:scale-95 transition-all"
        style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
        aria-label="Gönder"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-full">
      <header
        className="px-4 pt-5 pb-3 sticky top-0 z-10 backdrop-blur-md"
        style={{ backgroundColor: "color-mix(in srgb, var(--bg-base) 90%, transparent)" }}
      >
        <h1 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>
          Fello AI
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          Abonelik ve harcamalarını hatırlayan kişisel asistanın
        </p>
      </header>

      <div className="px-4 flex-1 flex flex-col gap-4 pt-2 pb-[72px]">
        <div className="flex flex-col gap-2">
          {composer()}
          {chatOpen && (
            <div
              className="rounded-[18px] overflow-hidden"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Fello AI
                </span>
                <button
                  type="button"
                  onClick={() => {
                    cancelAgent()
                    setIsTyping(false)
                    setChatOpen(false)
                    setChatMessages([])
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                  }}
                  aria-label="Kapat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                ref={chatScrollRef}
                className="px-4 py-3 max-h-[280px] overflow-y-auto no-scrollbar"
              >
                <MemoryChatMessages
                  messages={chatMessages}
                  onAsk={submitQuestion}
                  showSuggestions
                  isTyping={isTyping}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {(Object.keys(memoryTabLabels) as MemoryTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn("chip flex-1 justify-center", activeTab === tab && "chip--active")}
            >
              {memoryTabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === "ozet" && (
          <>
            {billCreepInsights.length > 0 && (
              <div>
                <h3 className="text-[15px] font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  Fatura hafızası
                </h3>
                <p className="text-[12px] mb-3 -mt-2" style={{ color: "var(--text-tertiary)" }}>
                  Aynı işletme için geçen ay ile bu ay karşılaştırması
                </p>
                <div className="flex flex-col gap-3">
                  {billCreepInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onNavigate={onNavigate}
                      onBillCreepOpen={onBillCreepOpen}
                      onSubscriptionDealOpen={onSubscriptionDealOpen}
                    />
                  ))}
                </div>
              </div>
            )}
            {subscriptionDeals.length > 0 && (
              <div>
                <h3 className="text-[15px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Paket karşılaştırması
                </h3>
                <p className="text-[12px] mb-3" style={{ color: "var(--text-tertiary)" }}>
                  Aynı içerik, daha uygun fiyat
                </p>
                <SubscriptionDealCarousel
                  deals={subscriptionDeals}
                  onSelect={(deal) => onSubscriptionDealOpen?.(deal)}
                />
              </div>
            )}
            <DonutChart />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                  Sistem Mesajları
                </h3>
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--accent-muted)",
                    color: "var(--accent-text)",
                  }}
                >
                  {mockSystemMessages.length} YENİ
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {mockSystemMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-[18px]"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                        {msg.from}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-[12px] leading-[1.5]" style={{ color: "var(--text-secondary)" }}>
                      {msg.text}
                    </p>
                    {msg.transactionId && onTransactionClick ? (
                      <button
                        type="button"
                        onClick={() => onTransactionClick(msg.transactionId!)}
                        className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold"
                        style={{ color: "var(--accent-text)" }}
                      >
                        İşlemi Gör <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span
                        className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold opacity-50"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        İşlemi Gör <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "abonelikler" && (
          <div>
            {subscriptionDeals.length > 0 && (
              <div className="mb-5">
                <h3 className="text-[15px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Daha ucuz alternatifler
                </h3>
                <p className="text-[12px] mb-3" style={{ color: "var(--text-tertiary)" }}>
                  Aynı içerik, farklı sağlayıcı — fiyat karşılaştırması
                </p>
                <SubscriptionDealCarousel
                  deals={subscriptionDeals}
                  onSelect={(deal) => onSubscriptionDealOpen?.(deal)}
                />
              </div>
            )}
            <h3 className="text-[15px] font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Abonelik Takibi
            </h3>
            <div className="wise-card">
              {mockSubscriptions.map((sub, i) => (
                <div
                  key={sub.id}
                  className={`flex items-center gap-3 p-4 ${
                    i !== mockSubscriptions.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                  }`}
                >
                  <div
                    className="relative w-10 h-10 rounded-[12px] shrink-0 overflow-hidden"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    <BrandLogoSlot
                      src={sub.logoSrc}
                      alt={sub.name}
                      className="absolute inset-0 brand-logo-slot--cell"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                        {sub.name}
                      </span>
                      <span className="text-[14px] font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                        {sub.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span
                        className={`text-[11px] font-semibold ${
                          sub.status.includes("Bitiyor")
                            ? "text-[var(--danger)]"
                            : "text-[var(--text-tertiary)]"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                        {sub.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analizler" && (
          <div>
            <h3 className="text-[15px] font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Kişisel Analizler
            </h3>
            <div className="flex flex-col gap-3">
              {allInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onNavigate={onNavigate}
                  onBillCreepOpen={onBillCreepOpen}
                  onSubscriptionDealOpen={onSubscriptionDealOpen}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
