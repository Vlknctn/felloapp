"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { pageTransition, springSoft } from "@/lib/motion"

export function AnimatedPage({
  children,
  pageKey,
  className,
}: {
  children: ReactNode
  pageKey: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        className={className}
        variants={pageTransition}
        initial={reduceMotion ? false : "initial"}
        animate="animate"
        exit={reduceMotion ? undefined : "exit"}
        transition={reduceMotion ? { duration: 0 } : springSoft}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
