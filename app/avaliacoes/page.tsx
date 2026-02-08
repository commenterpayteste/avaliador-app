"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Avaliacao = {
  id: string
  status: "enviado" | "aprovado" | "recusado"
  review_link: string | null
  created_at: string
  empresa: string
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    carregarAvaliacoes()
  }, [])

  async function carregarAvaliacoes() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data, error } = await supabase
      .from("vw_minhas_avaliacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setAvaliacoes(data || [])
    setLoading(false)
  }

  function voltar() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/perfil")
    }
  }

  function statusLabel(status: Avaliacao["status"]) {
    if (status === "enviado") return "EM ANÁLISE"
    if (status === "aprovado") return "APROVADO"
    return "RECUSADO"
  }

  function statusColor(status: Avaliacao["status"]) {
    if (status === "aprovado") return "text-green-400"
    if (status === "recusado") return "text-red-400"
    return "text-yellow-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] flex justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">

        {/* 🔙 VOLTAR */}
        <button
          onClick={voltar}
          className="text-green-400 text-sm font-semibold"
        >
          ← Voltar
        </button>

        {/* TÍTULO */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 mb-2 bg-green-400 rounded-md" />
          <h1 className="text-green-400 text-xl font-bold">Avaliações</h1>
        </div>

        {/* WIDGET EXPLICATIVO */}
        <div className="bg-[#1f3a2a] border border-green-400 rounded-2xl p-4 text-sm text-gray-200">
          <p className="text-green-400 font-semibold mb-2">
            💡 EXPLICAÇÃO ABAIXO:
          </p>
          <ul className="space-y-1 text-gray-300">
            <li>• Aqui você vê se sua avaliação está pendente, aprovada ou rejeitada</li>
            <li>• Assim que for aprovada, o valor fica disponível para saque</li>
          </ul>
        </div>

        {/* CONTINUE AVALIANDO */}
        <div className="bg-black border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-gray-300">
          🚀 <span className="text-white font-semibold">
            Você pode continuar avaliando
          </span>{" "}
          enquanto suas avaliações estão em análise.
        </div>

        {/* LISTA */}
        <div className="bg-black rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 text-green-400 text-xs font-semibold mb-3 px-2">
            <span>Empresa</span>
            <span className="text-center">Link</span>
            <span className="text-right">Status</span>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-6">
              Carregando avaliações…
            </p>
          ) : avaliacoes.length === 0 ? (
            <p className="text-center text-gray-400 py-6">
              Você ainda não fez nenhuma avaliação
            </p>
          ) : (
            <div className="space-y-3">
              {avaliacoes.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 items-center rounded-xl px-4 py-3 bg-[#2a2a2a] text-sm"
                >
                  <span className="truncate text-green-400">
                    {a.empresa}
                  </span>

                  <span className="text-center">
                    {a.review_link ? (
                      <a
                        href={a.review_link}
                        target="_blank"
                        className="underline text-green-400"
                      >
                        Link
                      </a>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </span>

                  <span
                    className={`text-right text-xs font-semibold ${statusColor(
                      a.status
                    )}`}
                  >
                    {statusLabel(a.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            disabled
            className="bg-green-400/40 text-black font-bold px-8 py-3 rounded-xl"
          >
            FILTRAR POR DATA
          </button>
        </div>
      </div>
    </div>
  )
}
