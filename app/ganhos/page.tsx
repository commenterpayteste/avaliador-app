"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Wallet = {
  saldo_disponivel: number
  saldo_total: number
}

type Transacao = {
  id: string
  valor: number
  created_at: string
}

type SaquePendente = {
  valor: number
  created_at: string
}

export default function Ganhos() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [historico, setHistorico] = useState<Transacao[]>([])
  const [saquePendente, setSaquePendente] = useState<SaquePendente | null>(null)
  const [saldoAnalise, setSaldoAnalise] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: walletData } = await supabase
      .from("wallets")
      .select("saldo_disponivel, saldo_total")
      .eq("user_id", user.id)
      .maybeSingle()

    const { data: historicoData } = await supabase
      .from("wallet_transactions")
      .select("id, valor, created_at")
      .eq("user_id", user.id)
      .eq("tipo", "ganho")
      .order("created_at", { ascending: false })

    const { data: saque } = await supabase
      .from("withdraw_requests")
      .select("valor, created_at")
      .eq("user_id", user.id)
      .eq("status", "pendente")
      .maybeSingle()

    const { count } = await supabase
      .from("review_slots")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "enviado")

    setSaldoAnalise((count || 0) * 3)
    setWallet(walletData || { saldo_disponivel: 0, saldo_total: 0 })
    setHistorico(historicoData || [])
    setSaquePendente(saque ?? null)
    setLoading(false)
  }

  async function solicitarSaque() {
    const ok = confirm(
      "Deseja solicitar o saque do saldo disponível?\n\nO pagamento será feito manualmente."
    )
    if (!ok) return

    const { error } = await supabase.rpc("solicitar_saque")

    if (error) {
      alert(error.message)
      return
    }

    alert("Saque solicitado com sucesso!")
    carregarDados()
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando ganhos…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] px-4 py-8 text-white">

      {/* 🔙 VOLTAR */}
      <button
        onClick={() => router.push("/perfil")}
        className="text-green-400 text-sm font-semibold mb-4"
      >
        ← Voltar
      </button>

      {/* BOTÃO SAQUE */}
      <div className="flex justify-end mb-4">
        <button
          onClick={solicitarSaque}
          disabled={!wallet || wallet.saldo_disponivel <= 0 || !!saquePendente}
          className={`font-bold px-6 py-2 rounded-xl ${
            wallet && wallet.saldo_disponivel > 0 && !saquePendente
              ? "bg-green-400 text-black"
              : "bg-green-400/40 text-black cursor-not-allowed"
          }`}
        >
          {saquePendente ? "SAQUE EM PROCESSAMENTO" : "SOLICITAR SAQUE"}
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-black rounded-2xl p-4 text-center">
          <p className="text-yellow-400 text-sm mb-1">EM ANÁLISE</p>
          <p className="text-xl font-bold">
            {formatarValor(saldoAnalise)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Aguardando aprovação
          </p>
        </div>

        <div className="bg-black rounded-2xl p-4 text-center">
          <p className="text-green-400 text-sm mb-1">DISPONÍVEL</p>
          <p className="text-xl font-bold">
            {formatarValor(wallet?.saldo_disponivel || 0)}
          </p>
        </div>

        <div className="bg-black rounded-2xl p-4 text-center">
          <p className="text-green-400 text-sm mb-1">FATURAMENTO</p>
          <p className="text-xl font-bold">
            {formatarValor(wallet?.saldo_total || 0)}
          </p>
        </div>
      </div>

      {/* WIDGET EXPLICATIVO */}
      <div className="bg-black border border-green-400/30 rounded-2xl p-4 mb-6 text-sm space-y-2 animate-pulse">
        <p className="text-yellow-400">
          🔍 <b>Saldo em análise:</b> Após aprovamos sua avaliação, o valor
          ficará disponível para saque.
        </p>

        <p className="text-green-400">
          💸 <b>Saldo disponível:</b> Valor liberado para solicitar saque
          diretamente no seu PIX.
        </p>

        <p className="text-gray-300">
          📈 <b>Faturamento:</b> Total acumulado que você já ganhou na plataforma.
        </p>
      </div>

      {/* SAQUE EM LIBERAÇÃO */}
      {saquePendente && (
        <div className="bg-black border border-yellow-400 rounded-2xl p-4 mb-6">
          <p className="text-yellow-400 font-semibold mb-1">
            ⏳ Saque em liberação
          </p>
          <p className="text-sm text-gray-300">
            Valor solicitado:
            <span className="text-white font-bold ml-1">
              {formatarValor(saquePendente.valor)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Solicitado em {formatarData(saquePendente.created_at)}
          </p>
        </div>
      )}

      {/* HISTÓRICO */}
      <div className="bg-black rounded-2xl p-4 space-y-3">
        {historico.length === 0 ? (
          <p className="text-center text-gray-400 py-6">
            Nenhum ganho ainda
          </p>
        ) : (
          historico.map((h) => (
            <div
              key={h.id}
              className="bg-[#2a2a2a] rounded-xl px-4 py-3 flex justify-between items-center text-sm"
            >
              <div>
                <p className="text-green-400 font-semibold">
                  Você ganhou
                </p>
                <p className="text-gray-400 text-xs">
                  {formatarData(h.created_at)}
                </p>
              </div>
              <p className="text-green-400 font-bold">
                {formatarValor(h.valor)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
