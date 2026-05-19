"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { SUGGESTED_QUESTIONS, type ChatMessage } from "@/lib/memory-chat"
import { fadeInUp, slideFromLeft, slideFromRight, springSnappy, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

function messageLabel(message: ChatMessage) {
  if (message.variant === "welcome") return "Karşılama"
  if (message.variant === "daily-summary" || message.id === "daily-summary") return "Günün özeti"
  return null
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const reduceMotion = useReducedMotion()
  const isUser = message.role === "user"
  const label = messageLabel(message)
  const isHighlight = message.variant === "welcome" || message.variant === "daily-summary"

  return (
    <motion.li
      layout={!reduceMotion}
      variants={isUser ? slideFromRight : slideFromLeft}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={springSnappy}
      className={cn(
        "max-w-[92%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-[1.45]",
        isUser ? "ml-auto" : "mr-auto",
        isHighlight && "border border-[var(--border-subtle)]",
      )}
      style={{
        backgroundColor: isUser
          ? "var(--accent)"
          : isHighlight
            ? "var(--accent-muted)"
            : "var(--bg-elevated)",
        color: isUser
          ? "var(--on-accent)"
          : isHighlight
            ? "var(--accent-text)"
            : "var(--text-primary)",
      }}
    >
      {label && (
        <span className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
          {label}
        </span>
      )}
      {message.text}
    </motion.li>
  )
}

function TypingIndicator() {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="mr-auto max-w-[72%] rounded-[14px] px-3.5 py-3 flex items-center gap-1"
      style={{ backgroundColor: "var(--bg-elevated)" }}
      aria-label="Fello AI yazıyor"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "var(--text-tertiary)" }}
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            delay: i * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.li>
  )
}

export function MemoryChatMessages({
  messages,
  onAsk,
  showSuggestions,
  isTyping = false,
  className,
}: {
  messages: ChatMessage[]
  onAsk: (question: string) => void
  showSuggestions: boolean
  isTyping?: boolean
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const hasUserMessage = messages.some((m) => m.role === "user")

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
    >
      <ul className="flex flex-col gap-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isTyping && <TypingIndicator />}
      </ul>

      {showSuggestions && !hasUserMessage && !isTyping && (
        <motion.div
          variants={fadeInUp}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          transition={{ ...springSnappy, delay: 0.12 }}
          className="mt-3 pt-1"
        >
          <p
            className="text-[11px] font-semibold mb-2 px-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Sana özel sorular
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <motion.button
                key={q}
                type="button"
                onClick={() => onAsk(q)}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springSnappy, delay: 0.08 + i * 0.04 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="chip text-[12px] py-1.5 px-3"
              >
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
