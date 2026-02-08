"use client"
import "./globals.css"
import { useRouter, usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()

  const isActive = (p: string) => path === p || path.startsWith(p + "/")

  const iconClass = (active: boolean) =>
    active
      ? "w-6 h-6 brightness-0 invert"
      : "w-6 h-6 opacity-60 hover:opacity-100 transition"

  // 🔥 AQUI É O PULO DO GATO
  const hideMenu = path === "/" || path === "/login"

  return (
    <html lang="pt-BR">
      <body className="bg-[#1f1f1f] text-white">
        <div className="pb-20">{children}</div>

        {/* MENU INFERIOR */}
        {!hideMenu && (
          <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#2a2a2a] flex justify-around py-3">

            {/* DASHBOARD */}
            <button onClick={() => router.push("/dashboard")}>
              <img
                src="/icons/home.svg"
                alt="Início"
                className={iconClass(isActive("/dashboard"))}
              />
            </button>

            {/* AVALIAÇÕES / GANHOS */}
            <button onClick={() => router.push("/avaliacoes")}>
              <img
                src="/icons/star.svg"
                alt="Ganhos"
                className={iconClass(isActive("/avaliacoes"))}
              />
            </button>

            {/* PERFIL */}
            <button onClick={() => router.push("/perfil")}>
              <img
                src="/icons/user.svg"
                alt="Perfil"
                className={iconClass(isActive("/perfil"))}
              />
            </button>

          </nav>
        )}
      </body>
    </html>
  )
}
