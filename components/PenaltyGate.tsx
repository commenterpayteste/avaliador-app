"use client"

import { ReactNode } from "react"
import { usePenalty } from "@/app/hooks/usePenaltys"

export default function PenaltyGate({
  children,
}: {
  children: ReactNode
}) {

  const {
    penaltyAtiva,
    loadingPenalty,
  } = usePenalty()

  if (loadingPenalty) {

    return (

      <div className="min-h-screen bg-[#121212] flex items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-gray-400">
            Carregando...
          </p>

        </div>

      </div>

    )
  }

  if (penaltyAtiva) {

    return (

      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-[#181818] border border-red-500/30 rounded-3xl p-6 text-center space-y-5">

          <div className="w-24 h-24 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-5xl">
            🚫
          </div>

          <div>

            <h1 className="text-3xl font-bold text-red-400">

              {penaltyAtiva.tipo === "account_locked"
                ? "Conta bloqueada"
                : "Conta suspensa"}

            </h1>

            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Sua conta recebeu uma punição da equipe.
            </p>

          </div>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-4 text-left">

            <p className="text-xs uppercase text-gray-500 mb-2">
              Motivo
            </p>

            <p className="text-sm text-gray-200 leading-relaxed">
              {penaltyAtiva.motivo}
            </p>

          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">

            <p className="text-xs text-red-300 leading-relaxed">

              {penaltyAtiva.tipo === "suspension_2h"
                ? "Seu acesso foi suspenso temporariamente por 2 horas."
                : "Sua conta foi bloqueada pela equipe."}

            </p>

          </div>

          <a
            href="https://wa.me/82996265512"
            target="_blank"
            className="block w-full bg-green-500 hover:bg-green-600 transition text-black font-bold py-3 rounded-2xl"
          >
            Entrar em contato no WhatsApp
          </a>

        </div>

      </div>

    )
  }

  return <>{children}</>
}