"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useMounted } from "@/hooks/use-mounted"
import { mockUser } from "@/lib/data"
import { Mail, Landmark, Brain, Bell, LogOut, ChevronRight, Shield, Moon, Sun } from "lucide-react"

const stats = [
  { label: "kayıt", value: "2.410" },
  { label: "gün", value: "148" },
  { label: "kategori", value: "23" },
]

export function ProfileView() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Avatar Section */}
      <header className="px-6 pt-8 pb-4 flex flex-col items-center">
        <div className="relative w-20 h-20 rounded-[24px] overflow-hidden mb-4 shadow-sm ring-1 ring-black/5">
          <Image
            src={mockUser.avatar}
            alt={`${mockUser.name} profil fotoğrafı`}
            fill
            className="object-cover"
            sizes="80px"
            priority
          />
        </div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{mockUser.name}</h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--text-tertiary)" }}>ahmet@example.com</p>

        {/* Stats Grid */}
        <div className="flex gap-3 mt-6 w-full">
          {stats.map((s) => (
            <div key={s.label}
              className="flex-1 rounded-[16px] p-3.5 flex flex-col items-center justify-center"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-[18px] font-mono font-bold leading-none" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider mt-1.5" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-4 flex-1 flex flex-col gap-6">
        {/* Appearance Group */}
        <div>
          <p className="section-header px-2">Görünüm</p>
          <div className="wise-card overflow-hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="list-item !border-b-0 w-full text-left hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div className="list-item__avatar" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}>
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="list-item__content flex-1">
                  <div className="list-item__title">Tema</div>
                  <div className="list-item__subtitle">{theme === "dark" ? "Karanlık mod aktif" : "Aydınlık mod aktif"}</div>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-10 h-6 rounded-full flex items-center px-1 transition-all"
                    style={{ backgroundColor: theme === "dark" ? "var(--accent)" : "var(--border-strong)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full transition-all shadow-sm"
                      style={{
                        backgroundColor: "white",
                        transform: theme === "dark" ? "translateX(16px)" : "translateX(0)",
                      }}
                    />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Accounts Group */}
        <div>
          <p className="section-header px-2">Bağlı Hesaplar</p>
          <div className="wise-card">
            <div className="list-item">
              <div className="list-item__avatar" style={{ backgroundColor: "rgba(234,67,53,0.1)", color: "#EA4335" }}>
                <Mail className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Gmail</div>
                <div className="list-item__subtitle" style={{ color: "var(--accent-text)" }}>Bağlı — ahmet@gmail.com</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
            <div className="list-item">
              <div className="list-item__avatar">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title" style={{ color: "var(--text-tertiary)" }}>Banka Hesabı</div>
                <div className="list-item__subtitle">Yakında geliyor</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "var(--warning-muted)", color: "var(--warning)" }}>YAKINDA</span>
            </div>
          </div>
        </div>

        {/* System Group */}
        <div>
          <p className="section-header px-2">Sistem</p>
          <div className="wise-card">
            <div className="list-item">
              <div className="list-item__avatar" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}>
                <Brain className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">CogniMemo Hafızası</div>
                <div className="list-item__subtitle">2.410 kayıt · 148 günlük veri</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
            <div className="list-item">
              <div className="list-item__avatar"><Bell className="w-5 h-5" /></div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Bildirim Tercihleri</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
            <div className="list-item">
              <div className="list-item__avatar"><Shield className="w-5 h-5" /></div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Gizlilik ve Güvenlik</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="flex items-center gap-3 p-4 rounded-[18px] justify-center font-bold text-[15px] active:scale-[0.98] transition-all cursor-pointer mt-2"
          style={{ backgroundColor: "var(--danger-muted)", color: "var(--danger)" }}
        >
          <LogOut className="w-5 h-5" /> Oturumu Kapat
        </button>

        <p className="text-center text-[11px] font-semibold mt-4 mb-8" style={{ color: "var(--text-disabled)" }}>
          Fello v0.1.0 · CogniMemo destekli
        </p>
      </div>
    </div>
  )
}
