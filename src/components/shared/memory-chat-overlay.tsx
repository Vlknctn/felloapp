"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Search, Send, Mic, X } from "@/lib/icons"
import { useApp } from "@/contexts/app-context"
import {
  createInitialChatMessages,
  SUGGESTED_QUESTIONS,
  type ChatMessage,
} from "@/lib/memory-chat"
import { useAgentChatSubmit } from "@/lib/use-agent-chat"
import { MemoryChatMessages } from "@/components/shared/memory-chat-messages"
import { sheetBackdrop, sheetPanel, springSoft } from "@/lib/motion"
import {
  getSpeechRecognitionCtor,
  useSpeechRecognitionAvailable,
} from "@/hooks/use-speech-recognition"

const typewritingTexts = [
  ...SUGGESTED_QUESTIONS.slice(0, 4),
  "Harcamalarını sor...",
]

export function MemoryChatOverlay({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { transactions } = useApp()
  const reduceMotion = useReducedMotion()
  const speechAvailable = useSpeechRecognitionAvailable()
  const [placeholderText, setPlaceholderText] = React.useState("")
  const [textIndex, setTextIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [listening, setListening] = React.useState(false)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const chatScrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { submit: submitAgent, cancel: cancelAgent } = useAgentChatSubmit()
  const assistantIdRef = React.useRef<string | null>(null)
  const [appShell, setAppShell] = React.useState<HTMLElement | null>(null)

  const close = React.useCallback(() => {
    cancelAgent()
    setIsTyping(false)
    setChatMessages([])
    setChatInput("")
    onOpenChange(false)
  }, [onOpenChange])

  React.useEffect(() => {
    setAppShell(document.getElementById("fello-app-shell"))
  }, [])

  React.useEffect(() => {
    if (!open) return
    setChatMessages(createInitialChatMessages(transactions))
    setIsTyping(false)
  }, [open, transactions])

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
    if (!open || !chatScrollRef.current) return
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }, [chatMessages, isTyping, open])

  React.useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [open])

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [cancelAgent])

  const submitQuestion = React.useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return
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
    [isTyping, chatMessages, submitAgent],
  )

  const sendChat = React.useCallback(() => {
    submitQuestion(chatInput)
  }, [chatInput, submitQuestion])

  const startVoice = React.useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
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
  }, [submitQuestion])

  const composer = (
    <motion.div
      className="relative flex items-center gap-2"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSoft, delay: 0.1 }}
    >
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "var(--text-tertiary)" }}
      />
      <input
        ref={inputRef}
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            sendChat()
          }
        }}
        className="fello-input h-[50px] pl-10 pr-[88px] flex-1 min-w-0"
        placeholder={placeholderText}
        aria-label="Fello AI sohbetinde sor"
      />
      <motion.button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          startVoice()
        }}
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        animate={
          listening && !reduceMotion
            ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0 0 transparent", "0 0 0 6px var(--accent-muted)", "0 0 0 0 transparent"] }
            : undefined
        }
        transition={{ duration: 1.2, repeat: listening ? Infinity : 0 }}
        disabled={!speechAvailable}
        className="absolute right-[46px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-[10px] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: listening ? "var(--accent-muted)" : "var(--bg-elevated)",
          color: listening ? "var(--accent-text)" : "var(--text-secondary)",
        }}
        aria-label="Sesle yaz"
        title={speechAvailable ? "Sesle yaz" : "Tarayıcı ses girişini desteklemiyor"}
      >
        <Mic className="w-3.5 h-3.5" />
      </motion.button>
      <motion.button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          sendChat()
        }}
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[10px] flex items-center justify-center"
        style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
        aria-label="Gönder"
      >
        <Send className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  )

  if (!appShell) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            key="backdrop"
            className="absolute inset-0 z-[58] bg-black/35 backdrop-blur-[2px] border-0 cursor-default"
            aria-label="Sohbeti kapat"
            onClick={close}
            variants={sheetBackdrop}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          />
          <motion.div
            key="panel"
            className="absolute left-3 right-3 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-[60] max-h-[min(560px,calc(100%-6rem))] flex flex-col rounded-[22px] overflow-hidden shadow-2xl min-h-0"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 -8px 40px color-mix(in srgb, var(--text-primary) 12%, transparent)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="memory-chat-title"
            variants={sheetPanel}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
            transition={springSoft}
          >
            <motion.div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2 id="memory-chat-title" className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                Fello AI
              </h2>
              <motion.button
                type="button"
                onClick={close}
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                className="h-9 w-9 rounded-full flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
            <motion.div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 min-h-0 max-h-[min(360px,46dvh)] no-scrollbar"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              <MemoryChatMessages
                messages={chatMessages}
                onAsk={submitQuestion}
                showSuggestions
                isTyping={isTyping}
              />
            </motion.div>
            <motion.div
              className="p-3 pt-0 shrink-0"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {composer}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    appShell,
  )
}
