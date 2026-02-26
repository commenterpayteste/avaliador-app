"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Dashboard = {
  avaliacoes_pendentes: number
  avaliacoes_aprovadas_total: number
  avaliacoes_aprovadas_hoje: number
  empresas_ativas: number
  vagas_restantes: number
  receita_total: number
  receita_hoje: number
  custo_total: number
  custo_hoje: number
}

export default function AdminDashboard() {
  const [dados, setDados] = useState<Dashboard | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await supabase
      .from("vw_admin_dashboard")
      .select("*")
      .single()

    setDados(data)
  }

  if (!dados) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Carregando métricas...
      </div>
    )
  }

  const lucroTotal = dados.receita_total - dados.custo_total
  const lucroHoje = dados.receita_hoje - dados.custo_hoje

  return (
    <div className="space-y-10">

      <h1 className="text-4xl font-bold text-white">
        📊 Dashboard Executivo
      </h1>

      {/* RECEITA & LUCRO */}
      <div className="grid grid-cols-4 gap-6">

        <CardBig
          title="Receita Total"
          value={format(dados.receita_total)}
          color="green"
        />

        <CardBig
          title="Receita Hoje"
          value={format(dados.receita_hoje)}
          color="green"
        />

        <CardBig
          title="Lucro Total"
          value={format(lucroTotal)}
          color="emerald"
        />

        <CardBig
          title="Lucro Hoje"
          value={format(lucroHoje)}
          color="emerald"
        />
      </div>

      {/* OPERACIONAL */}
      <div className="grid grid-cols-4 gap-6">

        <Card
          title="Avaliações Pendentes"
          value={dados.avaliacoes_pendentes}
        />

        <Card
          title="Aprovadas Hoje"
          value={dados.avaliacoes_aprovadas_hoje}
        />

        <Card
          title="Empresas Ativas"
          value={dados.empresas_ativas}
        />

        <Card
          title="Vagas Restantes"
          value={dados.vagas_restantes}
        />
      </div>

    </div>
  )
}

/* ================= COMPONENTES ================= */

function format(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}

function CardBig({ title, value, color }: any) {
  const cores: any = {
    green: "text-green-400",
    emerald: "text-emerald-400"
  }

  return (
    <div className="bg-gradient-to-br from-[#1b1f2a] to-[#11141a] border border-[#2a2f3a] rounded-3xl p-8 shadow-xl">

      <p className="text-gray-400 text-sm uppercase tracking-wider">
        {title}
      </p>

      <p className={`text-3xl font-bold mt-3 ${cores[color]}`}>
        {value}
      </p>
    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-[#161a21] border border-[#222] rounded-2xl p-6 shadow">

      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold text-white mt-2">
        {value}
      </p>
    </div>
  )
}