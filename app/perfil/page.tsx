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

    const user = data.user

    const nomeUsuario =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "Usuário"

    setNome(nomeUsuario)

    // mantém como já estava
    await supabase
      .from("profiles")
      .update({ nome: nomeUsuario })
      .eq("id", user.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] px-4 pt-6 pb-28 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-green-400 text-lg font-semibold">Olá!</p>
          <p className="text-white text-xl font-bold">{nome}</p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
          <img
            src="/icons/userverde.svg"
            alt="Perfil"
            className="w-6 h-6"
          />
        </div>
      </div>

      {/* 🔔 WIDGETS EXPLICATIVOS */}
      <div className="space-y-3 mb-5">

        {/* AVALIAÇÕES */}
        <div className="bg-black border border-green-500 rounded-xl p-4 animate-pulse [animation-duration:3s]">
          <p className="text-green-400 font-semibold mb-1">
            ⭐ Avaliações
          </p>
          <p className="text-sm text-gray-300 leading-snug">
            Após enviar, sua avaliação fica em análise.  
            Assim que for aprovada, o valor entra no seu saldo automaticamente.
          </p>
        </div>

        {/* PAGAMENTOS */}
        <div className="bg-black border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-white font-semibold mb-1">
            💰 Pagamentos
          </p>
          <p className="text-sm text-gray-300 leading-snug">
            Você pode continuar avaliando enquanto espera.  
            Quando solicitar saque, todo o saldo disponível é pago no seu PIX.
          </p>
        </div>

      </div>

      {/* CONTAINER DOS BOTÕES */}
      <div className="bg-black rounded-2xl p-4 space-y-4">

        {/* GRID SUPERIOR */}
        <div className="grid grid-cols-2 gap-4">

          {/* SEUS DADOS */}
          <button
            onClick={() => router.push("/dados")}
            className="rounded-xl bg-[#2a2a2a] h-24 flex flex-col items-center justify-center active:scale-95 transition"
          >
            <img
              src="/icons/userverde.svg"
              alt="Seus dados"
              className="w-7 h-7 mb-2"
            />
            <span className="text-green-400 text-sm font-semibold">
              Seus dados
            </span>
          </button>

          {/* AVALIAÇÕES */}
          <button
            onClick={() => router.push("/avaliacoes")}
            className="rounded-xl bg-[#2a2a2a] h-24 flex flex-col items-center justify-center active:scale-95 transition"
          >
            <img
              src="/icons/starverde.svg"
              alt="Avaliações"
              className="w-7 h-7 mb-2"
            />
            <span className="text-green-400 text-sm font-semibold">
              Suas Avaliações
            </span>
          </button>
        </div>

        {/* GANHOS */}
        <button
          onClick={() => router.push("/ganhos")}
          className="w-full rounded-2xl bg-[#2a2a2a] h-20 flex items-center justify-center gap-3 active:scale-95 transition"
        >
          <img
            src="/icons/cash.svg"
            alt="Ganhos"
            className="w-6 h-6"
          />
          <span className="text-green-400 font-semibold">
            Seus Ganhos
          </span>
        </button>

      </div>
    </div>
  )
}
