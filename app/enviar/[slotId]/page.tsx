"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams, useRouter } from "next/navigation"

export default function EnviarComentario() {
  const { slotId } = useParams()
  const [link, setLink] = useState("")
  const [empresa, setEmpresa] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchEmpresa()
  }, [])

  const fetchEmpresa = async () => {
    const { data, error } = await supabase
      .from("review_slots")
      .select("status, expires_at, companies(nome, link_maps)")
      .eq("id", slotId)
      .single()

    if (error || !data) {
      router.push("/dashboard")
      return
    }

    // ⛔ proteção extra: expirou pelo tempo
    if (new Date(data.expires_at) < new Date()) {
      alert("⏳ Sua avaliação expirou. Você pode avaliar outra empresa.")
      router.push("/dashboard")
      return
    }

    setEmpresa(data.companies)
  }

  const enviar = async () => {
    if (!link) return alert("Cole o link do comentário primeiro")

    const { error } = await supabase.rpc("enviar_comentario", {
      p_slot_id: slotId,
      p_link: link,
    })

    if (error) {
      if (
        error.message.includes("Tempo expirado") ||
        error.message.includes("reserva inválida")
      ) {
        alert("⏳ Sua avaliação expirou. Você pode avaliar outra empresa.")
        router.push("/dashboard")
        router.refresh()
        return
      }

      alert(error.message)
      return
    }

    router.push("/sucesso")
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Enviar avaliação</h1>

      {empresa && (
        <div className="bg-gray-100 p-4 rounded space-y-2 text-center">
          <p>
            Você avaliou a empresa:
            <br />
            <b>{empresa.nome}</b>
          </p>

          <a
            href={empresa.link_maps}
            target="_blank"
            className="bg-yellow-500 text-black px-4 py-2 rounded inline-block"
          >
            🔍 Abrir novamente no Google Maps
          </a>
        </div>
      )}

      <div className="space-y-2">
        <label className="font-medium">Cole o link do seu comentário:</label>
        <input
          placeholder="https://g.page/..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        onClick={enviar}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded text-lg"
      >
        Enviar para análise
      </button>
    </div>
  )
}
