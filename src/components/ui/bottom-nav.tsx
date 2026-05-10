"use client"

import * as React from "react"
import { Home, PieChart, Plus, Brain, User } from "lucide-react"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddClick?: () => void
}

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Ana Sayfa" },
    { id: "expenses", icon: PieChart, label: "Harcamalar" },
    { id: "add", icon: Plus, label: "", isFab: true },
    { id: "insights", icon: Brain, label: "Hafıza" },
    { id: "profile", icon: User, label: "Profil" },
  ]

  return (
    <div
      className="relative sticky bottom-0 w-full h-[88px] pb-[16px] backdrop-blur-xl flex items-center justify-around px-2 z-50 mt-auto"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-elevated) 85%, transparent)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        if (item.isFab) {
          return (
            <React.Fragment key={item.id}>
              <div className="w-14 h-full" />
              <button
                onClick={onAddClick}
                className="absolute left-1/2 top-[calc(50%-6px)] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-[16px] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--on-accent)",
                  boxShadow: "0 4px 20px color-mix(in srgb, var(--accent) 42%, transparent)",
                }}
              >
                <Icon className="w-7 h-7" />
              </button>
            </React.Fragment>
          )
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center justify-center w-14 h-full relative transition-colors cursor-pointer"
            style={{ color: isActive ? "var(--accent-text)" : "var(--text-tertiary)" }}
          >
            {isActive && (
              <div
                className="absolute top-0 w-8 h-[3px] rounded-b-[4px]"
                style={{ backgroundColor: "var(--accent)", boxShadow: "0 2px 8px color-mix(in srgb, var(--accent) 48%, transparent)" }}
              />
            )}
            <Icon className="w-[22px] h-[22px] mt-2" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
