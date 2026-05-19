"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle } from "@/lib/icons"
import { springSnappy } from "@/lib/motion"

export function Toast({ message }: { message: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
      transition={springSnappy}
      className="fello-toast fixed left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-[14px] shadow-lg"
      style={{
        bottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-primary)",
        maxWidth: "min(340px, calc(100% - 32px))",
      }}
      role="status"
      aria-live="polite"
    >
      <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "var(--accent-text)" }} />
      <span className="text-[14px] font-medium">{message}</span>
    </motion.div>
  )
}
