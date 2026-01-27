"use client"
import "./globals.css"
import { useRouter, usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()

  const active = (p: string) =>
    path.startsWith(p) ? "opacity-100" : "opacity-50"

  return (
    <html lang="pt-BR">
      <body className="bg-[#1f1f1f] text-white">
        <div className="pb-20">{children}</div>

        {/* MENU INFERIOR */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#2a2a2a] flex justify-around py-3">
          <button onClick={() => router.push("/dashboard")} className={active("/dashboard")}>
            🏠
          </button>
          <button onClick={() => router.push("/ganhos")} className={active("/ganhos")}>
            💰
          </button>
          <button onClick={() => router.push("/perfil")} className={active("/perfil")}>
            👤
          </button>
        </nav>
      </body>
    </html>
  )
}
