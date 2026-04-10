"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

// ======================================================
// PÁGINA /SUCESSO
// ------------------------------------------------------
// O que esta página faz:
// 1) Verifica se usuário tem WhatsApp
// 2) Se não tiver -> bloqueia até cadastrar
// 3) Depois verifica se tem PIX
// 4) NÃO altera nenhuma lógica do PIX
// 5) Revalida dados após salvar WhatsApp (blindagem)
// ======================================================

export default function Sucesso() {
  const [temPix, setTemPix] = useState<boolean | null>(null)
  const [whatsapp, setWhatsapp] = useState("")
  const [temWhatsapp, setTemWhatsapp] = useState<boolean | null>(null)
  const [salvandoWhatsapp, setSalvandoWhatsapp] = useState(false)

  const router = useRouter()

  // ======================================================
  // AO ENTRAR NA PÁGINA
  // ======================================================
  useEffect(() => {
    verificarDados()
    tocarSomCash()
  }, [])

  // ======================================================
  // SOM DE CONFIRMAÇÃO
  // ======================================================
  function tocarSomCash() {
    try {
      const audio = new Audio("/sounds/cash.mp3")
      audio.volume = 0.4
      audio.play().catch(() => {})
    } catch {}
  }

  // ======================================================
  // BUSCA PIX E WHATSAPP NO BANCO
  // ======================================================
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

  // ======================================================
  // SALVAR WHATSAPP (COM VALIDAÇÃO BR)
  // ======================================================
  async function salvarWhatsapp() {
    // remove qualquer coisa que não seja número
    const numeroLimpo = whatsapp.replace(/\D/g, "")

    // valida padrão Brasil
    // mínimo 10 (DDD + fixo)
    // máximo 11 (DDD + celular 9 dígitos)
    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      alert("Digite um WhatsApp válido com DDD (apenas números).")
      return
    }

    setSalvandoWhatsapp(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSalvandoWhatsapp(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp: numeroLimpo })
      .eq("id", user.id)

    if (error) {
      alert(error.message)
      setSalvandoWhatsapp(false)
      return
    }

    // 🔒 REVALIDAÇÃO COMPLETA
    // em vez de só setar true, buscamos novamente do banco
    await verificarDados()

    setWhatsapp("")
    setSalvandoWhatsapp(false)
  }

  // ======================================================
  // LOADING INICIAL
  // ======================================================
  if (temPix === null || temWhatsapp === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] flex flex-col items-center justify-center px-6 text-white">

      {/* ======================================================
          WHATSAPP OBRIGATÓRIO
      ====================================================== */}
      {!temWhatsapp && (
        <div className="bg-black border border-green-400 rounded-2xl p-6 w-full max-w-md text-center space-y-4 animate-pulse">
          <p className="text-green-400 font-bold text-lg">
            📲 Confirmação de pagamento
          </p>

          <p className="text-sm text-gray-300">
            Precisamos do seu WhatsApp para enviar o comprovante do pagamento.
          </p>

          <input
            type="tel"
            maxLength={11} // limite máximo BR
            placeholder="WhatsApp com DDD (ex: 11999999999)"
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(e.target.value.replace(/\D/g, ""))
            }
            className="
              w-full
              rounded-xl
              px-4
              py-3
              text-white
              text-center
              bg-[#0f0f0f]
              border
              border-white/20
              placeholder:text-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-green-400
            "
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

      {/* ======================================================
          RESTANTE DA PÁGINA (PIX INTACTO)
      ====================================================== */}
      {temWhatsapp && (
        <>
          <img
            src="/cash.png"
            alt="Dinheiro"
            className="w-20 h-20 mb-6"
          />

          <p className="text-xl font-semibold">
  💰 Você ganhou, <span className="text-green-400">CONTINUE ASSIM!</span>
</p>

<p className="text-sm text-gray-400 mt-2">
  Continue avaliando para acumular mais saldo
</p>

          <div className="bg-[#2a2a2a] rounded-xl p-4 w-full max-w-md text-center text-sm text-gray-300 mb-4 space-y-2">
            <p>✅ Sua avaliação foi enviada com sucesso e já está em análise.</p>

            {!temPix && (
              <p className="text-orange-400 font-semibold">
                ⚠️ Para sacar o seu saldo, cadastre sua chave PIX
              </p>
            )}

            <p className="text-gray-200">
              💸 Os pagamentos são liberados todos os dias às{" "}
              <strong>16:00</strong>.
            </p>
          </div>

          {temPix ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-400 text-black font-bold px-6 py-3 rounded-xl w-full max-w-md"
            >
              VOLTAR A GANHAR MAIS
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