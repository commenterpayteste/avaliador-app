"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  function Item({
    href,
    label,
  }: {
    href: string
    label: string
  }) {
    const ativo = pathname === href

    return (
      <Link
        href={href}
        className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
          ativo
            ? "bg-green-500 text-black"
            : "text-gray-400 hover:bg-[#1f1f1f] hover:text-white"
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#0b0b0b] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111] border-r border-[#1c1c1c] p-6 space-y-6">

        <div>
          <h2 className="text-xl font-bold text-green-400">
            Admin
          </h2>
          <p className="text-xs text-gray-500">
            Painel do sistema
          </p>
        </div>

        <nav className="space-y-2">
          <Item href="/admin" label="Dashboard" />
          <Item href="/admin/avaliacoes" label="Avaliações" />
          <Item href="/admin/empresas" label="Empresas" />
          <Item href="/admin/pagamentos" label="Pagamentos" />
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  )
}