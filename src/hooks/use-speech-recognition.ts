"use client"

import * as React from "react"
import { useMounted } from "@/hooks/use-mounted"

export function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** Avoids hydration mismatch: false on server and until client mount. */
export function useSpeechRecognitionAvailable(): boolean {
  const mounted = useMounted()
  return React.useMemo(() => mounted && getSpeechRecognitionCtor() !== null, [mounted])
}
