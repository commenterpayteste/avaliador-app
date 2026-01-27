"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Perfil() {
  const [nome, setNome] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push("/login")
      return
    }

    // 👇 nome vindo do Google / Auth
    const nomeUsuario =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      "Usuário"

    setNome(nomeUsuario)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] px-4 pt-6 pb-28">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-green-400 text-lg font-semibold">Olá!</p>
          <p className="text-white text-xl font-bold">{nome}</p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-green-400" />
        </div>
      </div>

      {/* CONTAINER PRETO */}
      <div className="bg-black rounded-2xl p-4 space-y-4">
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <button className="rounded-xl bg-[#2a2a2a] h-24 flex flex-col items-center justify-center active:scale-95 transition">
            <div className="w-8 h-8 rounded-full bg-green-400 mb-2" />
            <span className="text-green-400 text-sm font-semibold">
              Seus dados
            </span>
          </button>

          <button className="rounded-xl bg-[#1c1c1c] border border-blue-600 h-24 flex flex-col items-center justify-center active:scale-95 transition">
            <div className="w-8 h-8 bg-green-400 mb-2" />
            <span className="text-green-400 text-sm font-semibold">
              Avaliações
            </span>
          </button>
        </div>

        {/* Ganhos */}
        <button className="w-full rounded-2xl bg-[#2a2a2a] h-20 flex items-center justify-center active:scale-95 transition">
          <span className="text-green-400 font-semibold">
            Ganhos / saldo
          </span>
        </button>
      </div>
    </div>
  )
}
