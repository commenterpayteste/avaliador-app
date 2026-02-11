"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Perfil = {
  nome: string | null
  email: string | null
  pix_key: string | null
  pix_tipo: string | null
  whatsapp: string | null
}

export default function Dados() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  const [editandoPix, setEditandoPix] = useState(false)
  const [pixKey, setPixKey] = useState("")
  const [pixTipo, setPixTipo] = useState("cpf")
  const [pixSalvo, setPixSalvo] = useState(false)

  const [editandoZap, setEditandoZap] = useState(false)
  const [whatsapp, setWhatsapp] = useState("")

  const router = useRouter()

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const nomeAuth =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null

    const { data } = await supabase
      .from("profiles")
      .select("nome, pix_key, pix_tipo, whatsapp")
      .eq("id", user.id)
      .maybeSingle()

    const nomeFinal = nomeAuth || data?.nome || "Usuário"

    if (nomeAuth && nomeAuth !== data?.nome) {
      await supabase
        .from("profiles")
        .update({ nome: nomeAuth })
        .eq("id", user.id)
    }

    setPerfil({
      nome: nomeFinal,
      email: user.email ?? null,
      pix_key: data?.pix_key ?? null,
      pix_tipo: data?.pix_tipo ?? null,
      whatsapp: data?.whatsapp ?? null,
    })

    setPixKey(data?.pix_key ?? "")
    setPixTipo(data?.pix_tipo ?? "cpf")
    setWhatsapp(data?.whatsapp ?? "")

    setLoading(false)
  }

  async function salvarPix() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (!pixKey) {
      alert("Informe a chave PIX")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        pix_key: pixKey,
        pix_tipo: pixTipo,
      })
      .eq("id", user.id)

    if (error) {
      alert(error.message)
      return
    }

    setPerfil((prev) =>
      prev
        ? { ...prev, pix_key: pixKey, pix_tipo: pixTipo }
        : prev
    )

    setEditandoPix(false)
    setPixSalvo(true)
  }

  async function salvarWhatsapp() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (!whatsapp) {
      alert("Informe seu número de WhatsApp")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp })
      .eq("id", user.id)

    if (error) {
      alert(error.message)
      return
    }

    setPerfil((prev) =>
      prev ? { ...prev, whatsapp } : prev
    )

    setEditandoZap(false)
  }

  if (loading || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando dados…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] px-4 pt-6 pb-28 text-white">

      <button
        onClick={() => router.push("/dashboard")}
        className="text-green-400 text-sm font-semibold mb-4"
      >
        ← Voltar
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-green-400 text-lg font-semibold">Olá!</p>
          <p className="text-white text-xl font-bold">{perfil.nome}</p>
        </div>
      </div>

      <div className="bg-black rounded-2xl p-4 space-y-3 mb-6">
        <Campo label="Nome usuário" valor={perfil.nome} />
        <Campo label="Gmail" valor={perfil.email} />
        <Campo
          label="WhatsApp"
          valor={perfil.whatsapp || "Não cadastrado"}
          destaque={!perfil.whatsapp}
        />
        <Campo
          label="Pix"
          valor={
            perfil.pix_key
              ? `${perfil.pix_tipo?.toUpperCase()} • ${perfil.pix_key}`
              : "Não cadastrado"
          }
          destaque={!perfil.pix_key}
        />
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 bg-green-400 text-black font-bold py-3 rounded-xl"
        >
          AVALIAR E GANHAR
        </button>

        <button
          onClick={() => setEditandoZap(true)}
          className="flex-1 bg-blue-500 text-black font-bold py-3 rounded-xl"
        >
          {perfil.whatsapp ? "ALTERAR WHATSAPP" : "CADASTRAR WHATSAPP"}
        </button>
      </div>

      {editandoZap && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-green-400">
              Número de WhatsApp
            </h2>

            <input
              placeholder="Ex: 5582999999999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/30 rounded-xl p-3 text-white focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setEditandoZap(false)}
                className="flex-1 bg-gray-600 py-2 rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={salvarWhatsapp}
                className="flex-1 bg-green-400 text-black py-2 rounded-xl font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({
  label,
  valor,
  destaque = false,
}: {
  label: string
  valor: string | null
  destaque?: boolean
}) {
  return (
    <div className="bg-[#1c1c1c] rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`font-semibold ${
          destaque ? "text-yellow-400" : "text-white"
        }`}
      >
        {valor ?? "—"}
      </p>
    </div>
  )
}
