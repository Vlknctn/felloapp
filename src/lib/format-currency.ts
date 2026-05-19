export function formatTry(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number; absolute?: boolean }
): string {
  const value = options?.absolute ? Math.abs(amount) : amount
  const formatted = value.toLocaleString("tr-TR", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  })
  return `${formatted} ₺`
}
