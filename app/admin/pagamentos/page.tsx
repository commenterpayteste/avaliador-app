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

type UsuarioSaldo = {
  user_id: string
  usuario: string
  email: string
  pix_tipo: string
  pix_key: string
  saldo_disponivel: number
  saldo_total: number
}

export default function PagamentosAdmin() {
  const [saques, setSaques] = useState<Saque[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioSaldo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<"pendente" | "pago" | "usuarios">(
    "pendente"
  )
  const router = useRouter()

  useEffect(() => {
    verificarAdmin()
  }, [])

  useEffect(() => {
    carregarDados()
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

    carregarDados()
  }

  async function carregarDados() {
    setLoading(true)

    if (filtro === "usuarios") {
      const { data, error } = await supabase
        .from("vw_admin_usuarios_saldos")
        .select("*")

      if (error) {
        alert(error.message)
        return
      }

      setUsuarios(data || [])
      setLoading(false)
      return
    }

    const tabela =
      filtro === "pendente"
        ? "vw_admin_pagamentos"
        : "vw_admin_pagamentos_pagos"

    const { data, error } = await supabase.from(tabela).select("*")

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

    carregarDados()
  }

  async function pagarSaldo(userId: string, valor: number) {
    const ok = confirm(
      `Confirmar pagamento manual de ${valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}?`
    )
    if (!ok) return

    const { error } = await supabase.rpc(
      "admin_pagar_saldo_disponivel",
      {
        p_user_id: userId,
      }
    )

    if (error) {
      alert(error.message)
      return
    }

    carregarDados()
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
        Carregando…
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
        {["pendente", "pago", "usuarios"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f as any)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filtro === f
                ? "bg-green-400 text-black"
                : "bg-[#1c1c1c] text-white"
            }`}
          >
            {f === "pendente"
              ? "Pendentes"
              : f === "pago"
              ? "Pagos"
              : "Usuários"}
          </button>
        ))}
      </div>

      {/* ABA USUÁRIOS */}
      {filtro === "usuarios" && (
        <div className="space-y-4">
          {usuarios.length === 0 ? (
            <p className="text-gray-400">
              Nenhum usuário com saldo disponível.
            </p>
          ) : (
            usuarios.map((u) => (
              <div
                key={u.user_id}
                className="bg-black rounded-xl p-4 flex justify-between items-center"
              >
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-green-400">
                    {u.usuario}
                  </p>
                  <p className="text-gray-400">{u.email}</p>
                  <p>
                    PIX: {u.pix_tipo.toUpperCase()} • {u.pix_key}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-lg font-bold">
                    {formatarValor(u.saldo_disponivel)}
                  </p>
                  <button
                    onClick={() =>
                      pagarSaldo(u.user_id, u.saldo_disponivel)
                    }
                    className="bg-green-400 text-black px-4 py-2 rounded-lg font-bold"
                  >
                    PAGAR MANUALMENTE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ABA SAQUES */}
      {filtro !== "usuarios" && (
        <>
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
        </>
      )}
    </div>
  )
}
