"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Sucesso() {
  const [temPix, setTemPix] = useState<boolean | null>(null)
  const [whatsapp, setWhatsapp] = useState("")
  const [temWhatsapp, setTemWhatsapp] = useState<boolean | null>(null)
  const [salvandoWhatsapp, setSalvandoWhatsapp] = useState(false)

  const router = useRouter()

  useEffect(() => {
    verificarDados()
    tocarSomCash()
  }, [])

  function tocarSomCash() {
    try {
      const audio = new Audio("/sounds/cash.mp3")
      audio.volume = 0.4
      audio.play().catch(() => {})
    } catch {}
  }

  async function verificarDados() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select("pix_key, whatsapp")
      .eq("id", user.id)
      .maybeSingle()

    setTemPix(!!data?.pix_key)
    setTemWhatsapp(!!data?.whatsapp)
  }

  async function salvarWhatsapp() {
    if (!whatsapp || whatsapp.length < 10) {
      alert("Digite um WhatsApp válido com DDD.")
      return
    }

    setSalvandoWhatsapp(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp })
      .eq("id", user.id)

    if (error) {
      alert(error.message)
      setSalvandoWhatsapp(false)
      return
    }

    setTemWhatsapp(true)
    setSalvandoWhatsapp(false)
  }

  if (temPix === null || temWhatsapp === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] flex flex-col items-center justify-center px-6 text-white">

      {/* 🔒 WHATSAPP OBRIGATÓRIO */}
      {!temWhatsapp && (
        <div className="bg-black border border-green-400 rounded-2xl p-6 w-full max-w-md text-center space-y-4 animate-pulse">
          <p className="text-green-400 font-bold text-lg">
            📲 Confirmação de pagamento
          </p>

          <p className="text-sm text-gray-300">
            Precisamos do seu WhatsApp para enviar o comprovante do PIX
            e avisar quando seu saldo estiver disponível.
          </p>

          <input
            type="tel"
            placeholder="WhatsApp com DDD (ex: 11999999999)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl px-4 py-3 text-black text-center"
          />

          <button
            onClick={salvarWhatsapp}
            disabled={salvandoWhatsapp}
            className="w-full bg-green-400 text-black font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {salvandoWhatsapp ? "Salvando..." : "CONFIRMAR WHATSAPP"}
          </button>
        </div>
      )}

      {/* 🔽 RESTANTE SÓ APARECE SE TIVER WHATSAPP */}
      {temWhatsapp && (
        <>
          {/* ÍCONE */}
          <img
            src="/cash.png"
            alt="Dinheiro"
            className="w-20 h-20 mb-6"
          />

          {/* CARD PRINCIPAL */}
          <div className="bg-black rounded-2xl p-6 w-full max-w-md text-center mb-4">
            <p className="text-xl font-semibold">
              Parabéns!{" "}
              <span className="text-green-400">
                Você ganhou R$3,00
              </span>{" "}
              continue assim!
            </p>
          </div>

          {/* INFO */}
          <div className="bg-[#2a2a2a] rounded-xl p-4 w-full max-w-md text-center text-sm text-gray-300 mb-4 space-y-2">
            <p>✅ Sua avaliação foi enviada com sucesso e já está em análise.</p>

            {!temPix && (
              <p className="text-orange-400 font-semibold">
                ⚠️ Para receber o dinheiro, é necessário cadastrar uma chave PIX.
              </p>
            )}

            <p className="text-gray-200">
              💸 Os pagamentos são liberados todos os dias às{" "}
              <strong>16:00</strong>.
            </p>
          </div>

          {/* AÇÕES */}
          {temPix ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-400 text-black font-bold px-6 py-3 rounded-xl w-full max-w-md"
            >
              AVALIAR OUTRA E GANHAR MAIS R$3,00
            </button>
          ) : (
            <div className="w-full max-w-md space-y-3">
              <button
                onClick={() => {
                  localStorage.setItem("pix_pendente_avaliacao", "true")
                  router.push("/dados")
                }}
                className="bg-orange-500 text-black font-bold px-6 py-3 rounded-xl w-full"
              >
                CADASTRAR CHAVE PIX PARA RECEBER
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="bg-green-400/40 text-black font-bold px-6 py-3 rounded-xl w-full"
              >
                AVALIAR OUTRA EMPRESA
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
