"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Perfil = {
  nome: string | null
  email: string | null
  pix_key: string | null
  pix_tipo: string | null
}

export default function Dados() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [editandoPix, setEditandoPix] = useState(false)
  const [pixKey, setPixKey] = useState("")
  const [pixTipo, setPixTipo] = useState("cpf")
  const [pixSalvo, setPixSalvo] = useState(false)

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
      .select("nome, pix_key, pix_tipo")
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
    })

    setPixKey(data?.pix_key ?? "")
    setPixTipo(data?.pix_tipo ?? "cpf")

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
        ? {
            ...prev,
            pix_key: pixKey,
            pix_tipo: pixTipo,
          }
        : prev
    )

    setEditandoPix(false)
    setPixSalvo(true)
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

      {/* 🔙 VOLTAR */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-green-400 text-sm font-semibold mb-4"
      >
        ← Voltar
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-green-400 text-lg font-semibold">Olá!</p>
          <p className="text-white text-xl font-bold">{perfil.nome}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
          <div className="w-6 h-6 bg-green-400 rounded-full" />
        </div>
      </div>

      {/* INFO PIX SALVO */}
      {pixSalvo && (
        <div className="bg-[#1f3a2a] border border-green-400 rounded-2xl p-4 mb-6 text-sm animate-fade-in">
          <p className="text-green-400 font-semibold mb-1">
            ✅ PIX cadastrado com sucesso!
          </p>
          <p className="text-gray-300">
            Sua avaliação já foi enviada e está em análise.
          </p>
        </div>
      )}

      {/* CARD DADOS */}
      <div className="bg-black rounded-2xl p-4 space-y-3 mb-6">
        <Campo label="Nome usuário" valor={perfil.nome} />
        <Campo label="Gmail" valor={perfil.email} />
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

      {/* WIDGETS EXPLICATIVOS */}
      <div className="bg-black border border-green-400/30 rounded-2xl p-4 mb-4 text-sm">
        <p className="font-semibold text-green-400 mb-1">
          🔒 Por que precisamos do seu PIX?
        </p>
        <p className="text-gray-300">
          Usamos sua chave PIX apenas para realizar pagamentos.
          Seus dados não são compartilhados com terceiros.
        </p>
      </div>

      <div className="bg-black border border-gray-700 rounded-2xl p-4 mb-4 text-sm">
        <p className="font-semibold text-green-400 mb-1">
          💰 Como funciona o pagamento?
        </p>
        <p className="text-gray-300">
          Após a aprovação da avaliação, o valor entra no seu saldo.
          Quando você solicitar saque, todo o saldo disponível será pago no seu PIX.
        </p>
      </div>

      <div className="bg-black border border-gray-700 rounded-2xl p-4 mb-6 text-sm">
        <p className="text-gray-300">
          📌 Você pode continuar avaliando empresas normalmente,
          mesmo enquanto suas avaliações estão em análise.
        </p>
      </div>

      {/* BOTÕES */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 bg-green-400 text-black font-bold py-3 rounded-xl"
        >
          AVALIAR E GANHAR
        </button>

        <button
          onClick={() => setEditandoPix(true)}
          className="flex-1 bg-orange-500 text-black font-bold py-3 rounded-xl"
        >
          {perfil.pix_key ? "MUDAR PIX" : "CADASTRAR PIX"}
        </button>
      </div>

      {/* SUPORTE */}
      <button
        onClick={() => window.open("https://wa.me/5500000000000", "_blank")}
        className="w-full bg-[#1c1c1c] border border-gray-700 py-3 rounded-xl text-sm text-gray-300"
      >
        💬 Conversar com suporte
      </button>

      {/* MODAL PIX */}
      {editandoPix && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-green-400">
              Cadastrar PIX
            </h2>

            <select
              value={pixTipo}
              onChange={(e) => setPixTipo(e.target.value)}
              className="w-full bg-[#2a2a2a] rounded-xl p-3 text-white"
            >
              <option value="cpf">CPF</option>
              <option value="email">Email</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave aleatória</option>
            </select>

            <input
              placeholder="Digite sua chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-[#2a2a2a] rounded-xl p-3 text-white"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setEditandoPix(false)}
                className="flex-1 bg-gray-600 py-2 rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={salvarPix}
                className="flex-1 bg-green-400 text-black py-2 rounded-xl font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ICONES */}
      <div className="flex justify-center gap-6 opacity-80 mt-8">
        <img src="/icons/pix.png" alt="PIX" className="h-6" />
        <img src="/icons/seguranca.png" alt="Seguro" className="h-6" />
      </div>
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
