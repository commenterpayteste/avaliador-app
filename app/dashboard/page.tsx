"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Etapa = "idle" | "popup1" | "confirmar" | "popup2" | "tempo_esgotado"

const TEMPO_MAX = 10 * 60
const CACHE_KEY = "empresas_cache"

export default function Dashboard() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [empresaAtiva, setEmpresaAtiva] = useState<any>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<Etapa>("idle")
  const [missaoAtiva, setMissaoAtiva] = useState(false)
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)
  const [desistindo, setDesistindo] = useState(false)
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true)

  // 🔥 NOVOS ESTADOS (ISOLADOS)
  const [mostrarModalWhatsapp, setMostrarModalWhatsapp] = useState(false)
  const [whatsappInput, setWhatsappInput] = useState("")
  const [salvandoWhatsapp, setSalvandoWhatsapp] = useState(false)

  const router = useRouter()

  useEffect(() => {
    init()
  }, [])

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

  // 🔒 INTERCEPTAÇÃO SEGURA
  async function handleResgatar() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp")
      .eq("id", data.user.id)
      .maybeSingle()

    if (!profile?.whatsapp) {
      setMostrarModalWhatsapp(true)
      return
    }

    router.push(`/enviar/${slotId}`)
  }

  async function salvarWhatsapp() {
    const numeroLimpo = whatsappInput.replace(/\D/g, "")

    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      alert("Digite um WhatsApp válido com DDD (10 ou 11 números).")
      return
    }

    setSalvandoWhatsapp(true)

    const { data } = await supabase.auth.getUser()
    if (!data.user) return

    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp: numeroLimpo })
      .eq("id", data.user.id)

    if (error) {
      alert(error.message)
      setSalvandoWhatsapp(false)
      return
    }

    setMostrarModalWhatsapp(false)
    setSalvandoWhatsapp(false)

    router.push(`/enviar/${slotId}`)
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-28">

      {/* ... TODO SEU CÓDIGO ORIGINAL PERMANECE IGUAL ... */}

      {etapa === "popup2" && (
        <Modal>
          <h2 className="text-xl font-bold text-[#1DB954]">
            Já é seu!
          </h2>
          <p>Vá para o último passo</p>

          <button
            onClick={handleResgatar}
            className="w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
          >
            Resgatar R$3,00
          </button>
        </Modal>
      )}

      {/* 🔒 MODAL WHATSAPP */}
      {mostrarModalWhatsapp && (
        <Modal>
          <h2 className="text-lg font-bold text-green-400">
            📲 Confirme seu WhatsApp
          </h2>

          <p className="text-sm text-gray-300">
            Digite seu WhatsApp com DDD.  
            Exemplo: 11999999999
          </p>

          <input
            type="tel"
            placeholder="DDD + número"
            value={whatsappInput}
            onChange={(e) =>
              setWhatsappInput(e.target.value.replace(/\D/g, ""))
            }
            className="w-full bg-[#2a2a2a] rounded-xl p-3 text-white text-center"
          />

          <button
            onClick={salvarWhatsapp}
            disabled={salvandoWhatsapp}
            className="w-full bg-green-400 text-black font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {salvandoWhatsapp ? "Salvando..." : "Confirmar e continuar"}
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