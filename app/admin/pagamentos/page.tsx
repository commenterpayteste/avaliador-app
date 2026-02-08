"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Saque = {
  id: string
  usuario: string
  email: string
  valor: number
  pix_tipo: string
  pix_key: string
  created_at: string
  paid_at?: string
}

export default function PagamentosAdmin() {
  const [saques, setSaques] = useState<Saque[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<"pendente" | "pago">("pendente")
  const router = useRouter()

  useEffect(() => {
    verificarAdmin()
  }, [])

  useEffect(() => {
    carregarSaques()
  }, [filtro])

  async function verificarAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("email")
      .eq("email", user.email)
      .maybeSingle()

    if (!admin) {
      await supabase.auth.signOut()
      router.push("/login")
      return
    }

    carregarSaques()
  }

  async function carregarSaques() {
    setLoading(true)

    const tabela =
      filtro === "pendente"
        ? "vw_admin_pagamentos"
        : "vw_admin_pagamentos_pagos"

    const { data, error } = await supabase
      .from(tabela)
      .select("*")

    if (error) {
      alert(error.message)
      return
    }

    setSaques(data || [])
    setLoading(false)
  }

  async function marcarPago(id: string) {
    const ok = confirm("Confirmar que este saque foi PAGO?")
    if (!ok) return

    const { error } = await supabase.rpc("marcar_saque_pago", {
      p_id: id,
    })

    if (error) {
      alert(error.message)
      return
    }

    carregarSaques()
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString("pt-BR")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando pagamentos…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-8">
      <h1 className="text-2xl font-bold text-green-400 mb-4">
        Pagamentos
      </h1>

      {/* FILTROS */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltro("pendente")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            filtro === "pendente"
              ? "bg-green-400 text-black"
              : "bg-[#1c1c1c] text-white"
          }`}
        >
          Pendentes
        </button>

        <button
          onClick={() => setFiltro("pago")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            filtro === "pago"
              ? "bg-green-400 text-black"
              : "bg-[#1c1c1c] text-white"
          }`}
        >
          Pagos
        </button>
      </div>

      {saques.length === 0 ? (
        <p className="text-gray-400">
          Nenhum saque {filtro === "pendente" ? "pendente" : "pago"}.
        </p>
      ) : (
        <div className="space-y-4">
          {saques.map((s) => (
            <div
              key={s.id}
              className="bg-black rounded-xl p-4 flex justify-between items-center"
            >
              <div className="text-sm space-y-1">
                <p className="font-semibold text-green-400">
                  {s.usuario}
                </p>
                <p className="text-gray-400">{s.email}</p>
                <p>
                  PIX: {s.pix_tipo.toUpperCase()} • {s.pix_key}
                </p>

                <p className="text-xs text-gray-500">
                  Solicitado em {formatarData(s.created_at)}
                </p>

                {filtro === "pago" && s.paid_at && (
                  <p className="text-xs text-gray-500">
                    Pago em {formatarData(s.paid_at)}
                  </p>
                )}
              </div>

              <div className="text-right space-y-2">
                <p className="text-lg font-bold">
                  {formatarValor(s.valor)}
                </p>

                {filtro === "pendente" && (
                  <button
                    onClick={() => marcarPago(s.id)}
                    className="bg-green-400 text-black px-4 py-2 rounded-lg font-bold"
                  >
                    MARCAR COMO PAGO
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
