"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useMounted } from "@/hooks/use-mounted"
import { mockUser } from "@/lib/data"
import { Mail, Landmark, Brain, Bell, LogOut, ChevronRight, Shield, Moon, Sun } from "@/lib/icons"
import { FelloLogo } from "@/components/shared/fello-logo"
import { BrandLogoSlot } from "@/components/shared/brand-logo-slot"
import type { ProfileSettingsSection } from "@/components/views/profile-settings-view"

const connectedAccounts = [
  {
    id: "gmail",
    title: "Gmail",
    subtitle: "Bağlı — ahmet@gmail.com",
    connected: true,
    icon: Mail,
    iconStyle: { backgroundColor: "rgba(234,67,53,0.1)", color: "#EA4335" } as const,
  },
] as const

const stats = [
  { label: "kayıt", value: "2.410" },
  { label: "gün", value: "148" },
  { label: "kategori", value: "23" },
]

export function ProfileView({
  onSettingsClick,
}: {
  onSettingsClick?: (section: ProfileSettingsSection) => void
}) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div className="flex flex-col min-h-full">
      {/* Header — same pattern as other tabs */}
      <header className="px-4 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>
            Profil
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            ahmet@example.com
          </p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden relative ring-2 ring-[var(--border-subtle)]">
          <Image
            src={mockUser.avatar}
            alt={`${mockUser.name} profil`}
            fill
            className="object-cover"
            sizes="48px"
            priority
          />
        </div>
      </header>

      {/* Stats — single unified card with dividers */}
      <div className="px-4 mb-6">
        <div
          className="flex rounded-[18px] overflow-hidden"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex-1 py-4 flex flex-col items-center"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <p
                className="text-[20px] font-mono font-bold leading-none"
                style={{ color: "var(--text-primary)" }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] font-medium mt-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 flex-1 flex flex-col gap-6 pb-[72px]">
        {/* Appearance */}
        <div>
          <p className="section-header px-2">Görünüm</p>
          <div className="wise-card overflow-hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="list-item !border-b-0 w-full text-left hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div
                  className="list-item__avatar"
                  style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}
                >
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="list-item__content flex-1">
                  <div className="list-item__title">Tema</div>
                  <div className="list-item__subtitle">
                    {theme === "dark" ? "Karanlık mod aktif" : "Aydınlık mod aktif"}
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-10 h-6 rounded-full flex items-center px-1 transition-all"
                    style={{
                      backgroundColor:
                        theme === "dark" ? "var(--accent)" : "var(--border-strong)",
                    }}
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

        {/* Bağlı Hesaplar */}
        <div>
          <p className="section-header px-2">Bağlı Hesaplar</p>
          <div className="wise-card">
            {connectedAccounts.map((account) => {
              const Icon = "icon" in account ? account.icon : null
              return (
                <div key={account.id} className="list-item">
                  <div
                    className="list-item__avatar"
                    style={"iconStyle" in account ? account.iconStyle : undefined}
                  >
                    {"logo" in account &&
                    typeof (account as { logo?: string }).logo === "string" ? (
                      <BrandLogoSlot
                        src={(account as { logo: string }).logo}
                        alt={account.title}
                      />
                    ) : Icon ? (
                      <Icon className="w-5 h-5" />
                    ) : null}
                  </div>
                  <div className="list-item__content flex-1">
                    <div className="list-item__title">{account.title}</div>
                    <div
                      className="list-item__subtitle"
                      style={account.connected ? { color: "var(--accent-text)" } : undefined}
                    >
                      {account.subtitle}
                    </div>
                  </div>
                  <ChevronRight className="list-item__accessory w-4 h-4" />
                </div>
              )
            })}
            <button
              type="button"
              onClick={() => onSettingsClick?.("bank")}
              className="list-item w-full text-left hover:bg-[var(--bg-overlay)] transition-colors !border-b-0"
            >
              <div
                className="list-item__avatar"
                style={{ backgroundColor: "rgba(0, 196, 140, 0.12)", color: "var(--accent-text)" }}
              >
                <Landmark className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Banka Hesabı</div>
                <div className="list-item__subtitle">Henüz bağlı değil · Open Banking</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sistem */}
        <div>
          <p className="section-header px-2">Sistem</p>
          <div className="wise-card">
            <a
              href="https://cognimemo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="list-item hover:bg-[var(--bg-overlay)] transition-colors"
            >
              <div
                className="list-item__avatar"
                style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Fello AI</div>
                <div className="list-item__subtitle">cognimemo.com · 2.410 kayıt</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => onSettingsClick?.("notifications")}
              className="list-item w-full text-left hover:bg-[var(--bg-overlay)] transition-colors"
            >
              <div
                className="list-item__avatar"
                style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" }}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Bildirim Tercihleri</div>
                <div className="list-item__subtitle">Fatura uyarıları, haftalık özet</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSettingsClick?.("privacy")}
              className="list-item w-full text-left hover:bg-[var(--bg-overlay)] transition-colors !border-b-0"
            >
              <div
                className="list-item__avatar"
                style={{ backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#818CF8" }}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div className="list-item__content flex-1">
                <div className="list-item__title">Gizlilik ve Güvenlik</div>
                <div className="list-item__subtitle">Şifreleme, veri dışa aktarma</div>
              </div>
              <ChevronRight className="list-item__accessory w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="flex items-center gap-3 p-4 rounded-[18px] justify-center font-bold text-[15px] transition-all cursor-not-allowed opacity-60"
          style={{ backgroundColor: "var(--danger-muted)", color: "var(--danger)" }}
          title="Demo modunda kullanılamaz"
        >
          <LogOut className="w-5 h-5" /> Oturumu Kapat
        </button>

        <div className="flex flex-col items-center gap-2">
          <FelloLogo size={40} />
          <p
            className="text-center text-[11px] font-semibold"
            style={{ color: "var(--text-disabled)" }}
          >
            Fello v0.1.0 · CogniMemo destekli
          </p>
        </div>
      </div>
    </div>
  )
}
