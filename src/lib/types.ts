export interface User {
  name: string;
  avatar: string;
  thisMonthSpend: number;
  lastMonthSpend: number;
  delta: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  source: "gmail" | "manual" | "bank";
  logoUrl: string;
}

export type InsightNavTab = "home" | "expenses" | "insights" | "profile";

export interface Insight {
  id: string;
  type: "trend" | "anomaly" | "tip" | "memory";
  text: string;
  icon: string;
  severity: "info" | "warning" | "positive";
  /** Yaklaşan çekim veya vurgulanacak tutar (TRY); kartta „−59 ₺” gibi kırmızı gösterilir */
  paymentAmountTry?: number;
  /** Kart CTA ve tıklamada gidilecek sekme (demo / gelecek CogniMemo akışı) */
  action?: { label: string; tab: InsightNavTab };
}
