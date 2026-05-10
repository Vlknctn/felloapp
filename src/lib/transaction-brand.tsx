"use client"

import type { ElementType } from "react"
import {
  ShoppingCart,
  Coffee,
  Music,
  Car,
  Wallet,
  Utensils,
  Dumbbell,
  Gamepad2,
} from "lucide-react"

export const transactionIconMap: Record<string, ElementType> = {
  "shopping-cart": ShoppingCart,
  coffee: Coffee,
  music: Music,
  car: Car,
  wallet: Wallet,
  utensils: Utensils,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
}

export function isTransactionLogoImage(logoUrl: string): boolean {
  return logoUrl.startsWith("/")
}

export function getTransactionFallbackIcon(logoUrl: string): ElementType {
  return transactionIconMap[logoUrl] || Wallet
}
