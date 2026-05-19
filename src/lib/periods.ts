export type Period = "all" | "today" | "week" | "month"

export const periodLabels: Record<Period, string> = {
  all: "Tümü",
  today: "Bugün",
  week: "Bu Hafta",
  month: "Bu Ay",
}

export const PERIODS: Period[] = ["all", "today", "week", "month"]
