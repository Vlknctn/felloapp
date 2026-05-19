import { mockSubscriptions } from "./data"

/** Sağlayıcı adı → public/ altındaki logo yolu */
export const PROVIDER_LOGOS: Record<string, string> = {
  Turkcell: "/AMBLEM_SARI.jpg.webp",
  "Türk Telekom": "/turk-telekom-logo-png_seeklogo-272186.png",
  Vodafone: "/vodafone.svg",
  Netflix: "/netflix.png",
  "Disney+": "/disney-plus.svg",
  Spotify: "/Spotify_logo_without_text.svg.png",
  YouTube: "/Youtube_logo.png",
  OpenAI: "/chatgpt.png",
  Google: "/gemini.jpeg",
}

for (const sub of mockSubscriptions) {
  const provider = sub.name === "YouTube Premium" ? "YouTube" : sub.name
  if (!PROVIDER_LOGOS[provider]) PROVIDER_LOGOS[provider] = sub.logoSrc
}

export function getProviderLogo(provider: string): string | undefined {
  return PROVIDER_LOGOS[provider]
}
