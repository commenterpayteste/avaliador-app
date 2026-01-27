"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Etapa = "idle" | "popup1" | "confirmar" | "popup2"

export default function Dashboard() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [empresaAtiva, setEmpresaAtiva] = useState<any>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<Etapa>("idle")
  const [missaoAtiva, setMissaoAtiva] = useState(false)

  const router = useRouter()

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push("/login")
      return
    }

    // 🔎 verifica se existe missão válida
    const { data: missao } = await supabase
      .from("review_slots")
      .select("id, expires_at, companies(nome, link_maps)")
      .eq("status", "reservado")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle()

    if (missao) {
      setMissaoAtiva(true)
      setEmpresaAtiva(missao.companies)
      setSlotId(missao.id)
    } else {
      setMissaoAtiva(false)
      fetchEmpresas()
    }
  }

  async function fetchEmpresas() {
    const { data } = await supabase
      .from("vw_empresas_disponiveis")
      .select("*")
    setEmpresas(data || [])
  }

  async function reservar(empresa: any) {
    const { data, error } = await supabase.rpc("reservar_vaga", {
      p_company_id: empresa.id,
    })

    if (error) {
      alert(error.message)
      return
    }

    setEmpresaAtiva(empresa)
    setSlotId(data)
    setMissaoAtiva(true)
    setEtapa("popup1")
  }

  async function desistir() {
    if (!slotId) return

    await supabase
      .from("review_slots")
      .update({ status: "expirado" })
      .eq("id", slotId)

    await supabase.rpc("recalcular_vagas")

    reset()
    fetchEmpresas()
  }

  function reset() {
    setEmpresaAtiva(null)
    setSlotId(null)
    setMissaoAtiva(false)
    setEtapa("idle")
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-28">
      <header className="py-6 text-center">
        <h1 className="text-[#1DB954] font-bold">LOGO PRODUTO</h1>
      </header>

      {/* 🔔 NOTIFICAÇÃO DE MISSÃO */}
      {missaoAtiva && empresaAtiva && etapa === "idle" && (
        <div className="mx-4 mb-4 bg-[#1f3a2a] border border-[#1DB954] rounded-xl p-4">
          <p className="text-sm text-[#1DB954] font-semibold">
            ⏳ Avaliação pendente
          </p>
          <p className="text-xs text-gray-300 mb-3">
            {empresaAtiva.nome}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setEtapa("confirmar")}
              className="flex-1 bg-[#1DB954] text-black py-2 rounded-full font-bold"
            >
              Continuar
            </button>

            <button
              onClick={desistir}
              className="flex-1 bg-red-600 py-2 rounded-full font-bold"
            >
              Desistir
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      {!missaoAtiva && (
        <div className="px-4 space-y-4">
          {empresas.map((e) => (
            <div
              key={e.id}
              className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-4"
            >
              <h2 className="font-semibold">{e.nome}</h2>
              <p className="text-sm text-gray-400">
                Vagas: {e.vagas_disponiveis}
              </p>

              <button
                onClick={() => reservar(e)}
                className="mt-4 w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
              >
                Avaliar e Ganhar R$3,00
              </button>
            </div>
          ))}
        </div>
      )}

      {/* POPUP 1 */}
      {etapa === "popup1" && empresaAtiva && (
        <Modal>
          <h2 className="text-xl font-bold text-[#1DB954]">🎉 Opa!</h2>
          <p>Você vai ganhar <b>R$3,00</b> nessa avaliação</p>

          <button
            onClick={() => {
              window.open(empresaAtiva.link_maps, "_blank")
              setEtapa("idle")
            }}
            className="w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
          >
            Avaliar empresa
          </button>
        </Modal>
      )}

      {/* CONFIRMAR */}
      {etapa === "confirmar" && (
        <Modal>
          <h2 className="text-xl font-bold">Você já avaliou?</h2>

          <button
            onClick={() => setEtapa("popup2")}
            className="w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
          >
            Sim, já avaliei
          </button>
        </Modal>
      )}

      {/* POPUP 2 */}
      {etapa === "popup2" && (
        <Modal>
          <h2 className="text-xl font-bold text-[#1DB954]">
            Já é seu!
          </h2>
          <p>Vá para o último passo</p>

          <button
            onClick={() => router.push(`/enviar/${slotId}`)}
            className="w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
          >
            Resgatar R$3,00
          </button>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children }: { children: any }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-3xl p-6 space-y-4 w-full max-w-sm text-center">
        {children}
      </div>
    </div>
  )
}
