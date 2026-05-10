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

export default function Profile() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: "var(--bg-base)" }}>

      {/* Avatar */}
      <header className="px-4 pt-6 pb-3 flex flex-col items-center">
        <div className="relative w-[80px] h-[80px] rounded-[22px] overflow-hidden mb-3 ring-1 ring-black/5">
          <Image
            src={mockUser.avatar}
            alt={`${mockUser.name} profil fotoğrafı`}
            fill
            className="object-cover"
            sizes="80px"
            priority
          />
        </div>
        <h1 className="text-[20px] font-bold" style={{ color: "var(--text-primary)" }}>{mockUser.name}</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>ahmet@example.com</p>

        {/* Stats */}
        <div className="flex gap-3 mt-4 w-full">
          {stats.map((s) => (
            <div key={s.label}
              className="flex-1 rounded-[14px] p-3 flex flex-col items-center"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-[17px] font-mono font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-4 flex-1 flex flex-col gap-4 pt-3 pb-[100px]">

        {/* Tema Değiştir */}
        <div>
          <p className="section-header">Görünüm</p>
          <div className="wise-card wise-card--interactive">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="list-item !border-b-0 w-full text-left"
              >
                <div className="list-item__avatar" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}>
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="list-item__content">
                  <div className="list-item__title">Tema</div>
                  <div className="list-item__subtitle">{theme === "dark" ? "Karanlık mod aktif" : "Aydınlık mod aktif"}</div>
                </div>
                <div className="list-item__accessory">
                  <div
                    className="w-12 h-7 rounded-full flex items-center px-1 transition-all"
                    style={{ backgroundColor: theme === "dark" ? "var(--accent)" : "var(--border-default)" }}
                  >
                    <div
                      className="w-5 h-5 rounded-full transition-all"
                      style={{
                        backgroundColor: "white",
                        transform: theme === "dark" ? "translateX(20px)" : "translateX(0)",
                      }}
                    />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Bağlı Hesaplar */}
        <div>
          <p className="section-header">Bağlı Hesaplar</p>
          <div className="wise-card">
            <div className="list-item">
              <div className="list-item__avatar" style={{ backgroundColor: "rgba(234,67,53,0.1)", color: "#EA4335" }}>
                <Mail className="w-5 h-5" />
              </div>
              <div className="list-item__content">
                <div className="list-item__title">Gmail</div>
                <div className="list-item__subtitle" style={{ color: "var(--accent-text)" }}>Bağlı — ahmet@gmail.com</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
            <div className="list-item">
              <div className="list-item__avatar">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="list-item__content">
                <div className="list-item__title" style={{ color: "var(--text-tertiary)" }}>Banka Hesabı</div>
                <div className="list-item__subtitle">Yakında geliyor</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--warning-muted)", color: "var(--warning)" }}>YAKINDA</span>
            </div>
          </div>
        </div>

        {/* Sistem */}
        <div>
          <p className="section-header">Sistem</p>
          <div className="wise-card">
            <div className="list-item">
              <div className="list-item__avatar" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}>
                <Brain className="w-5 h-5" />
              </div>
              <div className="list-item__content">
                <div className="list-item__title">CogniMemo Hafızası</div>
                <div className="list-item__subtitle">2.410 kayıt · 148 günlük veri</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
            <div className="list-item">
              <div className="list-item__avatar"><Bell className="w-5 h-5" /></div>
              <div className="list-item__content">
                <div className="list-item__title">Bildirim Tercihleri</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
            <div className="list-item">
              <div className="list-item__avatar"><Shield className="w-5 h-5" /></div>
              <div className="list-item__content">
                <div className="list-item__title">Gizlilik ve Güvenlik</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Çıkış */}
        <button
          className="flex items-center gap-2.5 p-4 rounded-[16px] justify-center font-semibold text-[14px] active:scale-[0.98] transition-all cursor-pointer"
          style={{ backgroundColor: "var(--danger-muted)", color: "var(--danger)", border: "1px solid transparent" }}
        >
          <LogOut className="w-4 h-4" /> Oturumu Kapat
        </button>

        <p className="text-center text-[11px] font-medium mt-1" style={{ color: "var(--text-disabled)" }}>Fello v0.1.0 · CogniMemo destekli</p>
      </div>
    </div>
  )
}
