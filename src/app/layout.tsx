import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Fello - Unutmayan Finansal Arkadaşın",
  description: "E-posta ve mobil bankacılık entegrasyonları ile harcama takibi yapan, CogniMemo ile uzun vadeli kişisel hafıza oluşturan AI destekli finans asistanı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body className={`${dmSans.className} min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-8`}
            style={{ backgroundColor: "var(--bg-base)" }}>
        <Providers>
          {/* iPhone Mockup Container */}
          <div className="relative w-full sm:w-[390px] h-[100dvh] sm:h-[844px] sm:rounded-[48px] overflow-hidden shadow-2xl sm:ring-8 ring-zinc-900 sm:border-[12px] border-zinc-950 flex flex-col"
               style={{ backgroundColor: "var(--bg-base)" }}>

            {/* Dynamic Island Notch */}
            <div className="absolute top-0 inset-x-0 h-11 flex justify-center z-50 pointer-events-none">
              {/* Status Bar Mock */}
              <div className="absolute inset-x-6 top-3 flex justify-between items-center text-[11px] font-bold text-zinc-400">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm border-[1.5px] border-zinc-500 relative">
                    <div className="absolute inset-[1.5px] bg-zinc-400 rounded-[0.5px]" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
              <div className="w-[110px] h-[30px] bg-black rounded-b-[18px] mt-2" />
            </div>

            {/* App Content — portal hedefi: fixed yerine absolute ile telefon çerçevesi içinde */}
            <main id="fello-app-shell" className="flex-1 flex flex-col overflow-hidden relative z-0 pt-10"
                  style={{ backgroundColor: "var(--bg-base)" }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
