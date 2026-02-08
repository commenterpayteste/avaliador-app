"use client"

import { useRouter } from "next/navigation"

export default function PainelAdmin() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] px-6 py-10 text-white">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">
          Olá! <span className="text-green-400">Admin</span>
        </h1>
        <p className="text-gray-400">
          Confira as pendências do sistema:
        </p>
      </div>

      {/* CONTAINER */}
      <div className="bg-black rounded-3xl p-6 shadow-2xl">

        {/* GRID BOTÕES */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* VER AVALIAÇÕES */}
          <button
            onClick={() => router.push("/admin")}
            className="h-32 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-blue-400 font-semibold hover:bg-[#232323] transition"
          >
            Ver avaliações
          </button>

          {/* CADASTRAR EMPRESAS */}
          <button
            onClick={() => router.push("/painelsantz/cadastrar-empresas")}
            className="h-32 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-orange-400 font-semibold hover:bg-[#232323] transition"
          >
            Cadastrar empresas
          </button>

          {/* APROVAR PAGAMENTOS */}
          <button
            onClick={() => router.push("/admin/pagamentos")}
            className="h-32 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-green-400 font-semibold hover:bg-[#232323] transition"
          >
            Aprovar pagamentos
          </button>
        </div>

        {/* PAINÉIS FUTUROS */}
        <div className="h-28 rounded-2xl bg-[#141414] flex items-center justify-center text-gray-500 text-sm">
          Dashboards avançados (em breve)
        </div>
      </div>
    </div>
  )
}
