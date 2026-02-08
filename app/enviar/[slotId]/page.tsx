"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams, useRouter } from "next/navigation"

const TEMPO_MAX = 10 * 60 // 10 minutos

export default function EnviarComentario() {
  const { slotId } = useParams()
  const router = useRouter()

  const [empresa, setEmpresa] = useState<any>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [tempoRestante, setTempoRestante] = useState<number>(TEMPO_MAX)
  const [enviando, setEnviando] = useState(false)
  const [expirado, setExpirado] = useState(false)

  useEffect(() => {
    fetchEmpresa()

    // ⏱ cria início se não existir
    const key = `inicio_${slotId}`
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, Date.now().toString())
    }

    iniciarTimer()
  }, [])

  function iniciarTimer() {
    const key = `inicio_${slotId}`
    const inicio = localStorage.getItem(key)

    if (!inicio) return

    const interval = setInterval(() => {
      const passado = Math.floor((Date.now() - Number(inicio)) / 1000)
      const restante = TEMPO_MAX - passado

      if (restante <= 0) {
        clearInterval(interval)
        setTempoRestante(0)
        setExpirado(true)
        return
      }

      setTempoRestante(restante)
    }, 1000)

    return () => clearInterval(interval)
  }

  async function fetchEmpresa() {
    const { data, error } = await supabase
      .from("review_slots")
      .select("companies(nome, link_maps)")
      .eq("id", slotId)
      .single()

    if (error || !data) {
      router.push("/dashboard")
      return
    }

    setEmpresa(data.companies)
  }

  async function enviar() {
    if (!arquivo) {
      alert("Envie o print do comentário.")
      return
    }

    setEnviando(true)

    const filePath = `reviews/${slotId}-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from("reviews")
      .upload(filePath, arquivo)

    if (uploadError) {
      alert(uploadError.message)
      setEnviando(false)
      return
    }

    const { data } = supabase.storage
      .from("reviews")
      .getPublicUrl(filePath)

    const { error } = await supabase
      .from("review_slots")
      .update({
        review_image_url: data.publicUrl,
        status: "enviado",
      })
      .eq("id", slotId)

    if (error) {
      alert(error.message)
      setEnviando(false)
      return
    }

    localStorage.removeItem(`inicio_${slotId}`)
    router.push("/sucesso")
  }

  function formatarTempo(segundos: number) {
    const m = Math.floor(segundos / 60)
    const s = segundos % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white px-6 py-8 max-w-xl mx-auto space-y-6 relative">

      {/* MODAL EXPIRADO */}
      {expirado && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
          <div className="bg-black rounded-2xl p-6 text-center border border-red-500 max-w-sm w-full">
            <p className="text-red-400 text-lg font-bold mb-2">
              ⏳ Tempo esgotado
            </p>
            <p className="text-sm text-gray-300 mb-4">
              Sua vaga foi liberada para outro avaliador.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-green-400 text-black font-bold py-2 rounded-xl"
            >
              Voltar ao dashboard
            </button>
          </div>
        </div>
      )}

      {/* TIMER */}
      <div className="bg-black rounded-xl p-4 text-center border border-yellow-400">
        ⏱ Tempo restante:{" "}
        <span className="text-yellow-400 font-bold">
          {formatarTempo(tempoRestante)}
        </span>
      </div>

      {/* EMPRESA */}
      {empresa && (
        <div className="bg-black rounded-xl p-4 text-center space-y-2">
          <p className="text-gray-300">Empresa avaliada:</p>
          <p className="text-green-400 font-bold text-lg">
            {empresa.nome}
          </p>

          <a
            href={empresa.link_maps}
            target="_blank"
            className="inline-block bg-green-400 text-black px-4 py-2 rounded-lg font-bold"
          >
            Abrir no Google Maps
          </a>
        </div>
      )}

      {/* UPLOAD */}
      <div className="bg-black rounded-xl p-4 space-y-3">
        <p className="text-sm text-gray-300">
          Envie um PRINT do comentário publicado.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArquivo(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
      </div>

      {/* BOTÃO */}
      <button
        onClick={enviar}
        disabled={enviando || expirado}
        className="w-full bg-green-400 text-black font-bold py-3 rounded-xl disabled:opacity-50"
      >
        {enviando ? "Enviando..." : "Enviar para análise"}
      </button>
    </div>
  )
}
