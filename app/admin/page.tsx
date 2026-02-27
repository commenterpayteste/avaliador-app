"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

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

type Alertas = {
  pendentes: number
  saques_pendentes: number
  empresas_hoje: number
  aprovadas_hoje: number
}

export default function AdminDashboard() {

  const [dados, setDados] = useState<Dashboard | null>(null)
  const [grafico, setGrafico] = useState<any[]>([])
  const [alertas, setAlertas] = useState<Alertas | null>(null)
  
  useEffect(() => {
    carregarDashboard()
    carregarGrafico()
    carregarAlertas()
  }, [])

const router = useRouter()

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
  }
}

  async function carregarDashboard() {
    const { data } = await supabase
      .from("vw_admin_dashboard")
      .select("*")
      .single()

    setDados(data)
  }

  async function carregarGrafico() {
    const { data } = await supabase
      .from("vw_admin_receita_diaria")
      .select("*")

    if (data) {
      setGrafico(
        data.map((d: any) => ({
          ...d,
          lucro: d.receita - d.custo
        }))
      )
    }
  }

  async function carregarAlertas() {
    const { data } = await supabase
      .from("vw_admin_alertas")
      .select("*")
      .single()

    setAlertas(data)
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
    <div className="space-y-12">

      <h1 className="text-4xl font-bold text-white">
        📊 Dashboard Executivo
      </h1>

      {/* ALERTAS */}
      {alertas && (
        <div className="grid grid-cols-4 gap-4">

          <AlertCard title="Avaliações Pendentes" value={alertas.pendentes} color="red" />
          <AlertCard title="Saques Pendentes" value={alertas.saques_pendentes} color="yellow" />
          <AlertCard title="Empresas Hoje" value={alertas.empresas_hoje} color="blue" />
          <AlertCard title="Aprovadas Hoje" value={alertas.aprovadas_hoje} color="green" />

        </div>
      )}

      {/* RECEITA & LUCRO */}
      <div className="grid grid-cols-4 gap-6">

        <CardBig title="Receita Total" value={format(dados.receita_total)} color="green" />
        <CardBig title="Receita Hoje" value={format(dados.receita_hoje)} color="green" />
        <CardBig title="Lucro Total" value={format(lucroTotal)} color="emerald" />
        <CardBig title="Lucro Hoje" value={format(lucroHoje)} color="emerald" />

      </div>

      {/* OPERACIONAL */}
      <div className="grid grid-cols-4 gap-6">

        <Card title="Avaliações Pendentes" value={dados.avaliacoes_pendentes} />
        <Card title="Aprovadas Hoje" value={dados.avaliacoes_aprovadas_hoje} />
        <Card title="Empresas Ativas" value={dados.empresas_ativas} />
        <Card title="Vagas Restantes" value={dados.vagas_restantes} />

      </div>

      {/* GRÁFICO */}
      <div className="bg-[#161a21] border border-[#222] rounded-3xl p-8 shadow-xl">

        <h2 className="text-xl font-bold mb-6">
          📈 Crescimento Últimos 30 Dias
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={grafico}>
            <XAxis dataKey="data" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={3} />
            <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} />
            <Line type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

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

function AlertCard({ title, value, color }: any) {
  const cores: any = {
    red: "text-red-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    green: "text-green-400"
  }

  return (
    <div className="bg-[#1b1f2a] border border-[#2a2f3a] rounded-2xl p-4 shadow-md">
      <p className="text-gray-400 text-xs uppercase">
        {title}
      </p>
      <p className={`text-xl font-bold mt-2 ${cores[color]}`}>
        {value}
      </p>
    </div>
  )
}