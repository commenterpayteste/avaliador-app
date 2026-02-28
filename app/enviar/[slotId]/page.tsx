"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams, useRouter } from "next/navigation"

const TEMPO_MAX = 10 * 60

export default function EnviarComentario() {
  const { slotId } = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [empresa, setEmpresa] = useState<any>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [tempoRestante, setTempoRestante] = useState<number>(TEMPO_MAX)
  const [enviando, setEnviando] = useState(false)
  const [expirado, setExpirado] = useState(false)

  useEffect(() => {
    fetchEmpresa()

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

  function handleArquivo(file: File) {
    setArquivo(file)
    setConfirmado(false)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function enviar() {
    if (!arquivo || !confirmado) {
      alert("Confirme a imagem antes de enviar.")
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
    <div className="min-h-screen bg-[#0b0b0b] text-white px-6 py-8 max-w-xl mx-auto space-y-6">

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
        </div>
      )}

      {/* UPLOAD */}
{/* UPLOAD BONITÃO */}
<div className="bg-black rounded-2xl p-6 space-y-4 text-center border border-[#1f1f1f]">
  <p className="text-lg font-semibold">
    Oba! 🎉
  </p>

  <p className="text-sm text-gray-400">
    Agora é só enviar a foto do seu comentário publicado.
    Nossa equipe irá analisar em breve.
  </p>

  {!preview ? (
    <>
      <label
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-green-400 rounded-2xl p-6 hover:bg-green-400/10 transition"
      >
        <img
          src="/icons/image.png"
          alt="Enviar imagem"
          className="w-12 h-12"
        />

        <span className="text-green-400 text-sm font-semibold">
          Clique aqui para selecionar a imagem
        </span>
      </label>
    </>
  ) : (
    <>
      <img
        src={preview}
        className="rounded-xl max-h-80 object-contain border border-gray-700 mx-auto"
      />

      <p className="text-sm text-gray-400">
        Essa é a imagem do comentário que você fez para a empresa?
      </p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setConfirmado(true)}
          className={`px-6 py-2 rounded-xl font-semibold ${
            confirmado
              ? "bg-green-500 text-black"
              : "bg-[#1f1f1f] text-gray-300"
          }`}
        >
          Sim, confirmar
        </button>

        <button
          onClick={() => {
            setArquivo(null)
            setPreview(null)
            setConfirmado(false)
          }}
          className="px-6 py-2 rounded-xl bg-red-600"
        >
          Trocar imagem
        </button>
      </div>
    </>
  )}

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (file) {
        setArquivo(file)
        setConfirmado(false)

        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }}
    className="hidden"
  />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleArquivo(e.target.files[0])
            }
          }}
          className="hidden"
        />
      </div>

      {/* BOTÃO FINAL */}
<button
  onClick={enviar}
  disabled={!confirmado || enviando || expirado}
  className="w-full bg-green-400 text-black font-bold py-3 rounded-xl disabled:opacity-50"
>
  {enviando ? "Enviando..." : "Enviar para análise"}
</button>
    </div>
  )
}