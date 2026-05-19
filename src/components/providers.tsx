"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { SolarProvider } from "@solar-icons/react"
import { AppProvider } from "@/contexts/app-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <SolarProvider value={{ weight: "Linear", color: "currentColor" }}>
        <AppProvider>{children}</AppProvider>
      </SolarProvider>
    </ThemeProvider>
  )
}
