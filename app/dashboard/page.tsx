"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Etapa = "idle" | "popup1" | "confirmar" | "popup2" | "tempo_esgotado"

const TEMPO_MAX = 10 * 60 // 10 minutos
const CACHE_KEY = "empresas_cache"

export default function Dashboard() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [empresaAtiva, setEmpresaAtiva] = useState<any>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<Etapa>("idle")
  const [missaoAtiva, setMissaoAtiva] = useState(false)
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)
  const [desistindo, setDesistindo] = useState(false)

  // 🔥 NOVOS
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true)

  const router = useRouter()

  useEffect(() => {
    init()
  }, [])

  // TIMER
  useEffect(() => {
    if (!slotId) return

    const interval = setInterval(() => {
      const inicio = localStorage.getItem(`inicio_${slotId}`)
      if (!inicio) return

      const passado = Math.floor((Date.now() - Number(inicio)) / 1000)
      const restante = TEMPO_MAX - passado

      if (restante <= 0) {
        clearInterval(interval)
        handleTempoEsgotado()
      } else {
        setTempoRestante(restante)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [slotId])

  async function init() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push("/login")
      return
    }

    const { data: missao } = await supabase
      .from("review_slots")
      .select("id, companies(nome, link_maps)")
      .eq("status", "reservado")
      .maybeSingle()

    if (missao) {
      setMissaoAtiva(true)
      setEmpresaAtiva(missao.companies)
      setSlotId(missao.id)

      if (!localStorage.getItem(`inicio_${missao.id}`)) {
        localStorage.setItem(`inicio_${missao.id}`, Date.now().toString())
      }
    } else {
      // 🔥 tenta cache primeiro
      const cache = localStorage.getItem(CACHE_KEY)
      if (cache) {
        setEmpresas(JSON.parse(cache))
        setCarregandoEmpresas(false)
      }

      fetchEmpresas()
    }
  }

  async function fetchEmpresas() {
    setCarregandoEmpresas(true)

    const { data } = await supabase
      .from("vw_empresas_disponiveis")
      .select("*")

    if (data) {
      setEmpresas(data)
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    }

    // delay fake pra UX premium
    setTimeout(() => {
      setCarregandoEmpresas(false)
    }, 600)
  }

  async function reservar(empresa: any) {
    const { data, error } = await supabase.rpc("reservar_vaga", {
      p_company_id: empresa.id,
    })

    if (error) {
      alert(error.message)
      return
    }

    localStorage.setItem(`inicio_${data}`, Date.now().toString())
    setEmpresaAtiva(empresa)
    setSlotId(data)
    setMissaoAtiva(true)
    setEtapa("popup1")
    setTempoRestante(TEMPO_MAX)
  }

  async function desistir() {
    if (!slotId || desistindo) return

    setDesistindo(true)

    try {
      await supabase.rpc("desistir_avaliacao", { p_slot_id: slotId })
    } finally {
      localStorage.removeItem(`inicio_${slotId}`)
      reset()
      fetchEmpresas()
      setDesistindo(false)
    }
  }

  function handleTempoEsgotado() {
    if (!slotId) return
    setEtapa("tempo_esgotado")
  }

  async function confirmarTempoEsgotado() {
    await desistir()
  }

  function reset() {
    setEmpresaAtiva(null)
    setSlotId(null)
    setMissaoAtiva(false)
    setEtapa("idle")
    setTempoRestante(null)
  }

  function formatarTempo(segundos: number) {
    const m = Math.floor(segundos / 60)
    const s = segundos % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-28">
     <header className="py-6 flex justify-center">
  <img
    src="/icons/commenter1.png"
    alt="Commenter Pay"
    className="h-10 object-contain"
  />
</header>


      {/* MISSÃO ATIVA */}
      {missaoAtiva && empresaAtiva && etapa === "idle" && (
        <div className="mx-4 mb-4 bg-[#1f3a2a] border border-[#1DB954] rounded-xl p-4">
          <p className="text-sm text-[#1DB954] font-semibold">
            ⏳ Avaliação pendente —{" "}
            {tempoRestante !== null && formatarTempo(tempoRestante)}
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
              disabled={desistindo}
              onClick={desistir}
              className="flex-1 bg-red-600 py-2 rounded-full font-bold disabled:opacity-50"
            >
              {desistindo ? "Cancelando..." : "Desistir"}
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      {!missaoAtiva && (
        <div className="px-4 space-y-4">
          {carregandoEmpresas && (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          )}

          {!carregandoEmpresas &&
            empresas.map((e) => (
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

          {!carregandoEmpresas && (
            <p className="text-xs text-gray-500 text-center mt-6">
              🔄 Novas empresas podem aparecer a qualquer momento
            </p>
          )}
        </div>
      )}

      {/* MODAIS */}
      {etapa === "tempo_esgotado" && (
        <Modal>
          <h2 className="text-xl font-bold text-yellow-400">
            ⏳ Tempo esgotado
          </h2>
          <p className="text-gray-300">
            Sua vaga expirou e foi liberada para outro usuário.
          </p>

          <button
            onClick={confirmarTempoEsgotado}
            className="w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
          >
            Voltar ao painel
          </button>
        </Modal>
      )}

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

/* COMPONENTES AUX */

function LoadingCard() {
  return (
    <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-4 animate-pulse">
      <div className="h-4 w-2/3 bg-[#2a2a2a] rounded mb-2" />
      <div className="h-3 w-1/3 bg-[#2a2a2a] rounded mb-4" />
      <div className="h-10 w-full bg-[#2a2a2a] rounded-full" />
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
