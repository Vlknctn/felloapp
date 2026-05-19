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

/** Aylık merchant/fatura karşılaştırması ve operatör görüşme metni */
export interface BillCreepDetail {
  merchant: string;
  category: string;
  thisMonthAmount: number;
  lastMonthAmount: number;
  percentChange: number;
  absoluteDelta: number;
  callScript: string;
  supportPhone?: string;
  supportLabel?: string;
}

/** Paket içeriği ve fiyat karşılaştırması — daha ucuz eşdeğer öneri */
export interface SubscriptionDealDetail {
  category: "mobile" | "streaming" | "productivity";
  current: {
    provider: string;
    planName: string;
    monthlyPriceTry: number;
    features: string[];
    logoUrl?: string;
  };
  recommended: {
    provider: string;
    planName: string;
    monthlyPriceTry: number;
    features: string[];
    logoUrl?: string;
  };
  monthlySavingsTry: number;
  yearlySavingsTry: number;
  /** Her iki pakette de olan özellikler */
  matchedFeatures: string[];
  summary: string;
}

export interface Insight {
  id: string;
  type: "trend" | "anomaly" | "tip" | "memory";
  /** Kısa başlık — kart üst satırı */
  title: string;
  text: string;
  icon: string;
  severity: "info" | "warning" | "positive";
  /** Yaklaşan çekim veya vurgulanacak tutar (TRY); kartta „−59 ₺” gibi kırmızı gösterilir */
  paymentAmountTry?: number;
  /** Kart CTA ve tıklamada gidilecek sekme (demo / gelecek CogniMemo akışı) */
  action?: { label: string; tab: InsightNavTab };
  /** Fatura hafızası: aylık karşılaştırma + görüşme metni */
  billCreep?: BillCreepDetail;
  /** Abonelik: aynı içerik, daha ucuz alternatif */
  subscriptionDeal?: SubscriptionDealDetail;
}
