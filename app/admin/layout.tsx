"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [verificando, setVerificando] = useState(true)
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    verificarAdmin()
  }, [])

  async function verificarAdmin() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push("/login")
      return
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle()

    if (!admin) {
      router.push("/")
      return
    }

    setAutorizado(true)
    setVerificando(false)
  }

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

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-gray-400">
        Verificando acesso...
      </div>
    )
  }

  if (!autorizado) {
    return null
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
          <Item href="/admin/packages" label="Packages" />
          <Item href="/admin/anti-fraude" label="Fraudes" />
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  )
}