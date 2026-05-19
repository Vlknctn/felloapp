import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Fello — Abonelik ve Harcama Asistanı",
  description: "Aboneliklerini ve harcamalarını toplayan, hatırlayan AI asistanı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={plusJakarta.variable} suppressHydrationWarning>
      <body className={`${plusJakarta.className} min-h-screen flex items-center justify-center`}
            style={{ backgroundColor: "#f0f0f0" }}>
        <Providers>
          {/* iPhone 17 Mockup */}
          <div className="relative" style={{ width: 450, height: 920 }}>
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[680px] w-[300px] -translate-x-1/2 -translate-y-[48%] rounded-full blur-[48px] opacity-25"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(127, 237, 69, 0.28) 0%, rgba(127, 237, 69, 0.06) 50%, transparent 72%)",
              }}
            />

            {/* App screen content — positioned inside the phone screen area */}
            <div
              className="absolute flex flex-col overflow-hidden"
              style={{
                top: 16,
                left: 22,
                right: 22,
                bottom: 28,
                borderRadius: 52,
                backgroundColor: "var(--bg-base)",
              }}
            >
              <main
                id="fello-app-shell"
                className="flex-1 flex flex-col overflow-hidden pt-11"
                style={{ backgroundColor: "var(--bg-base)" }}
              >
                {children}
              </main>
            </div>

            {/* iPhone 17 frame overlay — sits on top, pointer-events:none so it doesn't block touches */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/iPhone 17.png"
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              style={{ zIndex: 10 }}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}
