"use client"

import * as React from "react"
import { ChevronLeft, Landmark, Bell, Shield, CheckCircle } from "@/lib/icons"
import { useApp } from "@/contexts/app-context"

export type ProfileSettingsSection = "bank" | "notifications" | "privacy"

type ToggleKey = "push" | "billAlerts" | "weeklySummary" | "subscriptionReminders"

const SECTION_META: Record<
  ProfileSettingsSection,
  { title: string; icon: typeof Landmark; iconStyle: React.CSSProperties }
> = {
  bank: {
    title: "Banka Hesabı",
    icon: Landmark,
    iconStyle: { backgroundColor: "rgba(0, 196, 140, 0.12)", color: "var(--accent-text)" },
  },
  notifications: {
    title: "Bildirim Tercihleri",
    icon: Bell,
    iconStyle: { backgroundColor: "var(--accent-muted)", color: "var(--accent-text)" },
  },
  privacy: {
    title: "Gizlilik ve Güvenlik",
    icon: Shield,
    iconStyle: { backgroundColor: "rgba(99, 102, 241, 0.12)", color: "#818CF8" },
  },
}

const SUPPORTED_BANKS = ["Garanti BBVA", "İş Bankası", "Ziraat Bankası", "Akbank", "Yapı Kredi"]

export function ProfileSettingsView({
  section,
  onBack,
}: {
  section: ProfileSettingsSection
  onBack: () => void
}) {
  const { showToast } = useApp()
  const meta = SECTION_META[section]
  const Icon = meta.icon

  const [toggles, setToggles] = React.useState<Record<ToggleKey, boolean>>({
    push: true,
    billAlerts: true,
    weeklySummary: false,
    subscriptionReminders: true,
  })

  const flipToggle = (key: ToggleKey) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <header
        className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md"
        style={{ backgroundColor: "color-mix(in srgb, var(--bg-base) 90%, transparent)" }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-[14px] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {meta.title}
        </h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-[72px] flex flex-col gap-6">
        <div
          className="flex items-center gap-3 p-4 rounded-[18px]"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={meta.iconStyle}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {meta.title}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {section === "bank" && "Harcamalarını otomatik senkronize et"}
              {section === "notifications" && "Hangi uyarıları alacağını seç"}
              {section === "privacy" && "Verilerin nasıl korunduğunu gör"}
            </p>
          </div>
        </div>

        {section === "bank" && (
          <>
            <div>
              <p className="section-header px-2">Durum</p>
              <div className="wise-card p-4">
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Banka hesabın henüz bağlı değil. Bağladığında kart ve EFT harcamaların otomatik
                  olarak Fello&apos;ya aktarılır; e-posta taramasına gerek kalmaz.
                </p>
              </div>
            </div>

            <div>
              <p className="section-header px-2">Desteklenen Bankalar</p>
              <div className="wise-card overflow-hidden">
                {SUPPORTED_BANKS.map((bank, i) => (
                  <div
                    key={bank}
                    className="list-item"
                    style={{
                      borderBottom:
                        i < SUPPORTED_BANKS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    <div className="list-item__content flex-1">
                      <div className="list-item__title">{bank}</div>
                      <div className="list-item__subtitle">Open Banking · Anlık senkron</div>
                    </div>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--accent-text)" }} />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast("Banka bağlantısı demo modunda kullanılamaz")}
              className="w-full py-4 rounded-[18px] font-bold text-[15px] active:scale-[0.98] transition-all"
              style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
            >
              Banka Hesabı Bağla
            </button>
          </>
        )}

        {section === "notifications" && (
          <div>
            <p className="section-header px-2">Bildirimler</p>
            <div className="wise-card overflow-hidden">
              <NotificationRow
                title="Anlık bildirimler"
                subtitle="Yeni harcama ve fatura tespit edildiğinde"
                enabled={toggles.push}
                onToggle={() => flipToggle("push")}
              />
              <NotificationRow
                title="Fatura artış uyarıları"
                subtitle="Abonelik ve faturalarda ani yükseliş olduğunda"
                enabled={toggles.billAlerts}
                onToggle={() => flipToggle("billAlerts")}
              />
              <NotificationRow
                title="Haftalık özet"
                subtitle="Her Pazartesi harcama özeti"
                enabled={toggles.weeklySummary}
                onToggle={() => flipToggle("weeklySummary")}
              />
              <NotificationRow
                title="Abonelik hatırlatıcı"
                subtitle="Yenileme tarihinden 3 gün önce"
                enabled={toggles.subscriptionReminders}
                onToggle={() => flipToggle("subscriptionReminders")}
                isLast
              />
            </div>
          </div>
        )}

        {section === "privacy" && (
          <>
            <div>
              <p className="section-header px-2">Veri Güvenliği</p>
              <div className="wise-card p-4 flex flex-col gap-3">
                <PrivacyItem
                  title="Uçtan uca şifreleme"
                  detail="Harcama kayıtların aktarım ve depolama sırasında AES-256 ile korunur."
                />
                <PrivacyItem
                  title="Yerel hafıza"
                  detail="Kişisel analizler CogniMemo hafızanda saklanır; üçüncü taraflarla paylaşılmaz."
                />
                <PrivacyItem
                  title="KVKK uyumlu"
                  detail="Verilerin yalnızca harcama analizi için işlenir; reklam profili oluşturulmaz."
                />
              </div>
            </div>

            <div>
              <p className="section-header px-2">Hesap</p>
              <div className="wise-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => showToast("Veri dışa aktarma demo modunda kullanılamaz")}
                  className="list-item w-full text-left hover:bg-[var(--bg-overlay)] transition-colors"
                >
                  <div className="list-item__content flex-1">
                    <div className="list-item__title">Verilerimi dışa aktar</div>
                    <div className="list-item__subtitle">JSON formatında indir</div>
                  </div>
                  <ChevronLeft className="list-item__accessory w-4 h-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Hesap silme demo modunda kullanılamaz")}
                  className="list-item w-full text-left hover:bg-[var(--bg-overlay)] transition-colors !border-b-0"
                >
                  <div className="list-item__content flex-1">
                    <div className="list-item__title" style={{ color: "var(--danger)" }}>
                      Hesabımı sil
                    </div>
                    <div className="list-item__subtitle">Tüm veriler kalıcı olarak silinir</div>
                  </div>
                  <ChevronLeft className="list-item__accessory w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function NotificationRow({
  title,
  subtitle,
  enabled,
  onToggle,
  isLast,
}: {
  title: string
  subtitle: string
  enabled: boolean
  onToggle: () => void
  isLast?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="list-item w-full text-left hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ borderBottom: isLast ? "none" : undefined }}
    >
      <div className="list-item__content flex-1">
        <div className="list-item__title">{title}</div>
        <div className="list-item__subtitle">{subtitle}</div>
      </div>
      <div
        className="w-10 h-6 rounded-full flex items-center px-1 transition-all shrink-0"
        style={{
          backgroundColor: enabled ? "var(--accent)" : "var(--border-strong)",
        }}
      >
        <div
          className="w-4 h-4 rounded-full transition-all shadow-sm"
          style={{
            backgroundColor: "white",
            transform: enabled ? "translateX(16px)" : "translateX(0)",
          }}
        />
      </div>
    </button>
  )
}

function PrivacyItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
        {detail}
      </p>
    </div>
  )
}
