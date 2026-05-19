"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle } from "@/lib/icons"
import type { BillCreepDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

function formatTry(amount: number): string {
  return `${Math.abs(amount).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`
}

export function BillCreepSheet({
  open,
  detail,
  onClose,
  onCopied,
}: {
  open: boolean
  detail: BillCreepDetail | null
  onClose: () => void
  onCopied?: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  const [appShell, setAppShell] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setAppShell(document.getElementById("fello-app-shell"))
  }, [])

  React.useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const copyScript = React.useCallback(async () => {
    if (!detail) return
    try {
      await navigator.clipboard.writeText(detail.callScript)
      setCopied(true)
      onCopied?.()
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard blocked */
    }
  }, [detail, onCopied])

  if (!open || !detail || !appShell) return null

  return createPortal(
    <div className="absolute inset-0 z-40">
      <SheetBackdrop onClose={onClose} />
      <SheetPanel detail={detail} onClose={onClose} copied={copied} onCopy={copyScript} />
    </div>,
    appShell,
  )
}

function SheetBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
      aria-hidden
    />
  )
}

function SheetPanel({
  detail,
  onClose,
  copied,
  onCopy,
}: {
  detail: BillCreepDetail
  onClose: () => void
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bill-creep-title"
      className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[24px] border-t border-[var(--border-subtle)] max-h-[88%]"
      style={{ backgroundColor: "var(--bg-surface)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-center pt-2 pb-1">
        <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "var(--border-default)" }} />
      </div>
      <div className="flex items-center justify-between px-4 pt-1 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Fatura hafızası
          </p>
          <h2 id="bill-creep-title" className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>
            {detail.merchant}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--bg-elevated)" }}
          aria-label="Kapat"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
        <ComparisonRow label="Geçen ay" amount={detail.lastMonthAmount} muted />
        <ComparisonRow label="Bu ay" amount={detail.thisMonthAmount} highlight />
        <div
          className="mt-3 flex items-center justify-between rounded-[14px] px-3.5 py-3"
          style={{ backgroundColor: "var(--warning-muted)" }}
        >
          <span className="text-[12px] font-semibold" style={{ color: "var(--warning)" }}>
            Artış
          </span>
          <span className="font-mono text-[14px] font-bold" style={{ color: "var(--danger)" }}>
            +{formatTry(detail.absoluteDelta)} · %{detail.percentChange}
          </span>
        </div>

        {detail.supportPhone && detail.supportPhone !== "—" && (
          <p className="mt-4 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {detail.supportLabel ?? detail.merchant}:{" "}
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              {detail.supportPhone}
            </span>
          </p>
        )}

        <p className="mt-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Görüşme metni
        </p>
        <p
          className="mt-2 rounded-[14px] border border-[var(--border-subtle)] p-3.5 text-[13px] leading-[1.55]"
          style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-base)" }}
        >
          {detail.callScript}
        </p>
        <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--text-disabled)" }}>
          Komisyon veya aracı yok — metni kopyalayıp operatörle kendin görüşebilirsin.
        </p>
      </div>

      <SheetActions detail={detail} copied={copied} onCopy={onCopy} />
    </div>
  )
}

function SheetActions({
  detail,
  copied,
  onCopy,
}: {
  detail: BillCreepDetail
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="shrink-0 border-t border-[var(--border-subtle)] px-4 py-3 pb-5 flex gap-2">
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3.5 text-[14px] font-bold transition-opacity",
        )}
        style={{
          backgroundColor: copied ? "var(--positive-muted)" : "var(--accent)",
          color: copied ? "var(--positive)" : "var(--on-accent)",
        }}
      >
        {copied ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Kopyalandı
          </>
        ) : (
          "Metni kopyala"
        )}
      </button>
      {detail.supportPhone && detail.supportPhone !== "—" && (
        <a
          href={`tel:${detail.supportPhone.replace(/\s/g, "")}`}
          className="flex items-center justify-center rounded-[14px] px-4 py-3.5 text-[14px] font-bold border border-[var(--border-default)]"
          style={{ color: "var(--accent-text)" }}
        >
          Ara
        </a>
      )}
    </div>
  )
}

function ComparisonRow({
  label,
  amount,
  muted,
  highlight,
}: {
  label: string
  amount: number
  muted?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] font-medium" style={{ color: muted ? "var(--text-tertiary)" : "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        className="font-mono text-[15px] font-bold"
        style={{ color: highlight ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {formatTry(amount)}
      </span>
    </div>
  )
}
