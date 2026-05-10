"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { mockInsights } from "@/lib/data"
import { InsightCard } from "@/components/shared/insight-card"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import { Search, Send, ChevronRight, Mic, X } from "lucide-react"

const typewritingTexts = [
  "Geçen ay ne kadar kahve içtim?",
  "Trendyol harcamalarım ne alemde?",
  "Ulaşıma bu hafta ne kadar gitti?",
  "En çok harcadığım marka hangisi?",
  "CogniMemo'ya sor...",
]

const subscriptions: {
  id: number
  name: string
  status: string
  date: string
  amount: string
  logoSrc: string
}[] = [
  { id: 1, name: "YouTube Premium", status: "Deneme Bitiyor", date: "3 gün kaldı", amount: "59.99 ₺", logoSrc: "/Youtube_logo.png" },
  { id: 2, name: "Netflix", status: "Aktif", date: "12 May", amount: "114.99 ₺", logoSrc: "/netflix.png" },
  { id: 3, name: "Spotify", status: "Kullanılmıyor", date: "24 May", amount: "59.99 ₺", logoSrc: "/Spotify_logo_without_text.svg.png" },
  { id: 4, name: "Turkcell", status: "Fatura Kesildi", date: "Dün", amount: "425.00 ₺", logoSrc: "/AMBLEM_SARI.jpg.webp" },
]

const messages = [
  { id: 1, from: "Turkcell", text: "Degerli musterimiz, 0532******* nolu hattinizin Nisan ayi faturasi 425.00 TL olarak kesilmistir. Son odeme tarihi: 15.05.2026", time: "2 saat önce" },
  { id: 2, from: "Netflix", text: "Üyelik ücretlerimiz güncelleniyor. Yeni dönemde üyeliğiniz 114.99 TL üzerinden yenilenecektir.", time: "Dün" },
]

function DonutChart() {
  return (
    <div className="wise-card p-5">
      <p className="section-header !p-0 mb-4">Dönemsel Özet</p>
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <div className="w-24 h-24 rounded-full" style={{ background: `conic-gradient(#3B82F6 0% 42%, #06B6D4 42% 70%, #F59E0B 70% 88%, #A855F7 88% 100%)` }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center" style={{ backgroundColor: "var(--bg-surface)" }}>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>Mayıs</span>
              <span className="text-[13px] font-bold font-mono" style={{ color: "var(--text-primary)" }}>8.4K</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          {[
            { label: "Market", pct: 42, color: "#3B82F6" },
            { label: "Ulaşım", pct: 28, color: "#06B6D4" },
            { label: "Kahve", pct: 18, color: "#F59E0B" },
            { label: "Abonelik", pct: 12, color: "#A855F7" },
          ].map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{d.label}</span>
              </div>
              <span className="text-[12px] font-semibold font-mono" style={{ color: "var(--text-primary)" }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type ChatMessage = { id: string; role: "user" | "assistant"; text: string }

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function InsightsView() {
  const [placeholderText, setPlaceholderText] = React.useState("")
  const [textIndex, setTextIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [chatOpen, setChatOpen] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [listening, setListening] = React.useState(false)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const chatScrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [appShell, setAppShell] = React.useState<HTMLElement | null>(null)

  const openChat = React.useCallback(() => setChatOpen(true), [])

  React.useEffect(() => {
    setAppShell(document.getElementById("fello-app-shell"))
  }, [])

  React.useEffect(() => {
    const currentText = typewritingTexts[textIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholderText(currentText.substring(0, placeholderText.length + 1))
        if (placeholderText === currentText) setTimeout(() => setIsDeleting(true), 2000)
      } else {
        setPlaceholderText(currentText.substring(0, placeholderText.length - 1))
        if (placeholderText === "") { setIsDeleting(false); setTextIndex((p) => (p + 1) % typewritingTexts.length) }
      }
    }, isDeleting ? 45 : 90)
    return () => clearTimeout(timeout)
  }, [placeholderText, isDeleting, textIndex])

  React.useEffect(() => {
    if (!chatOpen || !chatScrollRef.current) return
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }, [chatMessages, chatOpen])

  React.useEffect(() => {
    if (!chatOpen) return
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [chatOpen])

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [])

  const sendChat = React.useCallback(() => {
    const text = chatInput.trim()
    if (!text) return
    openChat()
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput("")
    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "Bu bir demo yanıtı. Gerçek uygulamada CogniMemo harcama geçmişinize göre burada cevap üretecek.",
        },
      ])
    }, 600)
  }, [chatInput, openChat])

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
      if (transcript) setChatInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      setListening(false)
      recognitionRef.current = null
    }
  }, [openChat])

  const composer = () => (
    <div className="relative flex items-center gap-2">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
      <input
        ref={inputRef}
        type="text"
        value={chatInput}
        onChange={(e) => {
          openChat()
          setChatInput(e.target.value)
        }}
        onFocus={() => openChat()}
        onMouseDown={() => openChat()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            sendChat()
          }
        }}
        className="fello-input h-[50px] pl-10 pr-[88px] flex-1 min-w-0"
        placeholder={placeholderText}
        aria-label="Hafıza sohbetinde ara"
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          startVoice()
        }}
        className="absolute right-[46px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-[10px] flex items-center justify-center active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        style={{
          backgroundColor: listening ? "var(--accent-muted)" : "var(--bg-elevated)",
          color: listening ? "var(--accent-text)" : "var(--text-secondary)",
        }}
        aria-label="Sesle yaz"
        title={getSpeechRecognitionCtor() ? "Sesle yaz" : "Tarayıcı ses girişini desteklemiyor"}
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
    <div className="flex flex-col min-h-full relative">
      <header className="px-4 pt-4 pb-3 sticky top-0 z-10 backdrop-blur-md"
              style={{ backgroundColor: "color-mix(in srgb, var(--bg-base) 90%, transparent)" }}>
        <h1 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>Hafıza</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-tertiary)" }}>CogniMemo yapay zekası tarafından desteklenir</p>
      </header>

      <div className="px-4 flex-1 flex flex-col gap-6 pt-1 pb-[60px]">
        <DonutChart />

        {!chatOpen && composer()}

        {/* ── Gelen Mesajlar (SMS/Sistem) ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>Sistem Mesajları</h3>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-accent-muted text-accent">2 YENİ</span>
          </div>
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 rounded-[18px]" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{msg.from}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{msg.time}</span>
                </div>
                <p className="text-[12px] leading-[1.5]" style={{ color: "var(--text-secondary)" }}>{msg.text}</p>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer" style={{ color: "var(--accent-text)" }}>
                  İşlemi Gör <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Abonelik Takibi ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>Abonelik Takibi</h3>
          </div>
          <div className="wise-card">
            {subscriptions.map((sub, i) => (
              <div key={sub.id} className={`flex items-center gap-3 p-4 ${i !== subscriptions.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''}`}>
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
                    <span className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{sub.name}</span>
                    <span className="text-[14px] font-mono font-bold" style={{ color: "var(--text-primary)" }}>{sub.amount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className={`text-[11px] font-semibold ${sub.status.includes('Bitiyor') ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]'}`}>
                      {sub.status}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{sub.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analizler */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>Kişisel Analizler</h3>
          </div>
          {mockInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {chatOpen &&
        appShell &&
        createPortal(
          <>
            <button
              type="button"
              className="absolute inset-0 z-[58] bg-black/35 backdrop-blur-[2px] border-0 cursor-default"
              aria-label="Sohbeti kapat"
              onClick={() => setChatOpen(false)}
            />
            <div
              className="absolute left-3 right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[60] max-h-[min(560px,calc(100%-6rem))] flex flex-col rounded-[22px] overflow-hidden shadow-2xl min-h-0"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 -8px 40px color-mix(in srgb, var(--text-primary) 12%, transparent)",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="memory-chat-title"
            >
              <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 id="memory-chat-title" className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                  Hafıza sohbeti
                </h2>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="h-9 w-9 rounded-full flex items-center justify-center active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 min-h-0 max-h-[min(320px,42dvh)] no-scrollbar"
              >
                {chatMessages.length === 0 ? (
                  <p className="text-[13px] leading-relaxed text-center px-2 py-8" style={{ color: "var(--text-tertiary)" }}>
                    Aklına gelen bir harcama veya soru yaz; CogniMemo geçmişini burada özetleyecek.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {chatMessages.map((m) => (
                      <li
                        key={m.id}
                        className={`max-w-[92%] rounded-[16px] px-3.5 py-2.5 text-[13px] leading-[1.45] ${
                          m.role === "user" ? "ml-auto" : "mr-auto"
                        }`}
                        style={{
                          backgroundColor: m.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
                          color: m.role === "user" ? "var(--on-accent)" : "var(--text-primary)",
                        }}
                      >
                        {m.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-3 pt-0 shrink-0">{composer()}</div>
            </div>
          </>,
          appShell
        )}
    </div>
  )
}
