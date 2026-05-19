"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Home, PieChart, Brain, User } from "@/lib/icons"
import { springSnappy } from "@/lib/motion"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAssistantClick?: () => void
}

export function BottomNav({ activeTab, onTabChange, onAssistantClick }: BottomNavProps) {
  const reduceMotion = useReducedMotion()
  const navItems = [
    { id: "home", icon: Home, label: "Ana Sayfa" },
    { id: "expenses", icon: PieChart, label: "Harcamalar" },
    { id: "insights", icon: Brain, label: "Fello AI" },
    { id: "profile", icon: User, label: "Profil" },
  ]

  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  const tabButton = (item: (typeof navItems)[0]) => {
    const Icon = item.icon
    const isActive = activeTab === item.id
    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        aria-current={isActive ? "page" : undefined}
        className="flex flex-col items-center justify-center w-14 h-full relative transition-colors cursor-pointer"
        style={{ color: isActive ? "var(--accent-text)" : "var(--text-tertiary)" }}
      >
        {isActive && (
          <motion.div
            layoutId="nav-active-indicator"
            className="absolute top-0 w-8 h-[3px] rounded-b-[4px]"
            style={{
              backgroundColor: "var(--accent)",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--accent) 48%, transparent)",
            }}
            transition={reduceMotion ? { duration: 0 } : springSnappy}
          />
        )}
        <motion.div
          animate={isActive && !reduceMotion ? { scale: 1.06, y: -1 } : { scale: 1, y: 0 }}
          transition={springSnappy}
        >
          <Icon className="w-[22px] h-[22px] mt-2" weight={isActive ? "Bold" : "Linear"} />
        </motion.div>
        <span className="text-[10px] font-medium mt-1">{item.label}</span>
      </button>
    )
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSnappy, delay: 0.05 }}
      className="relative sticky bottom-0 mx-auto w-[calc(100%-12px)] max-w-full h-[88px] pb-[16px] backdrop-blur-xl flex items-center justify-around px-2 z-50 mt-auto"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-elevated) 85%, transparent)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {leftItems.map(tabButton)}

      <div className="w-14 h-full" />

      <motion.button
        type="button"
        onClick={onAssistantClick}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  "0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent)",
                  "0 0 0 10px color-mix(in srgb, var(--accent) 18%, transparent)",
                  "0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent)",
                ],
              }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[calc(50%-6px)] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-[16px] flex items-center justify-center cursor-pointer overflow-hidden"
        aria-label="Asistan sohbeti"
      >
        <Image src="/logo.svg" alt="" width={56} height={56} className="w-full h-full" />
      </motion.button>

      {rightItems.map(tabButton)}
    </motion.div>
  )
}
