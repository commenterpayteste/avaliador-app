"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Etapa = "idle" | "popup1" | "confirmar" | "popup2" | "tempo_esgotado"

const TEMPO_MAX = 10 * 60
const CACHE_KEY = "empresas_cache"

export default function Dashboard() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [saldo, setSaldo] = useState(0)
  const [notificacao, setNotificacao] = useState<string | null>(null) //notificacoes
  const [somAtivo, setSomAtivo] = useState(true)
  const [empresaAtiva, setEmpresaAtiva] = useState<any>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<Etapa>("idle")
  const [missaoAtiva, setMissaoAtiva] = useState(false)
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)
  const [desistindo, setDesistindo] = useState(false)
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true)
const [modoPopup, setModoPopup] = useState<"intro" | "tutorial">("intro")
const [copiado, setCopiado] = useState(false)
type Comentario = {
  id: string
  texto: string
  ativo: boolean
}

const [comentarioSelecionado, setComentarioSelecionado] = useState<Comentario | null>(null)
const [comentarioDoSlot, setComentarioDoSlot] = useState<any>(null)

  // 🔒 WHATSAPP (NÃO BLOQUEANTE)
  const [temWhatsapp, setTemWhatsapp] = useState<boolean | null>(null)
  const [mostrarModalZap, setMostrarModalZap] = useState(false)
  const [whatsapp, setWhatsapp] = useState("")
  const [salvandoZap, setSalvandoZap] = useState(false)

  const router = useRouter()

  const nomes = [
  "João", "Maria", "Carlos", "Ana", "Pedro",
  "Lucas", "Fernanda", "Rafael", "Juliana",
  "Bruno", "Camila", "Diego", "Larissa",
  "André", "Beatriz", "Matheus", "Aline",
  "Rodrigo", "Patrícia", "Gustavo"
]

const acoes = [
  "acabou de sacar",
  "ganhou",
  "avaliou uma empresa",
  "já acumulou",
  "realizou um saque de"
]

const valores = [3, 6, 9, 12, 15, 18, 21, 30, 45, 69, 105]

useEffect(() => {
  init()
  verificarWhatsapp()

  const somSalvo = localStorage.getItem("som_notificacao")

  if (somSalvo === "off") {
    setSomAtivo(false)
  }
}, [])

  function gerarMensagem() {
  const nome = nomes[Math.floor(Math.random() * nomes.length)]
  const acao = acoes[Math.floor(Math.random() * acoes.length)]

  // se for ação sem valor
  if (acao === "avaliou uma empresa") {
    return `🔥 ${nome} avaliou uma empresa`
  }

  const valor = valores[Math.floor(Math.random() * valores.length)]

  return `💰 ${nome} ${acao} R$${valor},00`
}

  useEffect(() => { //intervalo notificacao
  function mostrarNotificacao() {
    const mensagem = gerarMensagem()
    setNotificacao(mensagem)

    // som notificação
if (localStorage.getItem("som_notificacao") !== "off") {
  const audio = new Audio("/sounds/cash.mp3")
  audio.volume = 0.4
  audio.play().catch(() => {})
}
}

  // mostra primeira
  mostrarNotificacao()

  const interval = setInterval(() => {
    mostrarNotificacao()
  }, 15000) // nova a cada 15s

  return () => clearInterval(interval)
}, [])

  // =========================
  // VERIFICAR WHATSAPP
  // =========================
  async function verificarWhatsapp() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp")
      .eq("id", data.user.id)
      .maybeSingle()

    setTemWhatsapp(!!profile?.whatsapp)
  }

  // =========================
  // SALVAR WHATSAPP
  // =========================
  async function salvarWhatsapp() {
    const numeroLimpo = whatsapp.replace(/\D/g, "")

    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      alert("Digite um WhatsApp válido com DDD.")
      return
    }

    setSalvandoZap(true)

    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      setSalvandoZap(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp: numeroLimpo })
      .eq("id", data.user.id)

    if (error) {
      alert(error.message)
      setSalvandoZap(false)
      return
    }

    await verificarWhatsapp()
    setMostrarModalZap(false)
    setWhatsapp("")
    setSalvandoZap(false)
  }

  // =========================
  // TIMER ORIGINAL (INALTERADO)
  // =========================
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    router.push("/login")
    return
  }
const { data: wallet } = await supabase
  .from("wallets")
  .select("saldo_disponivel")
  .eq("user_id", user.id)
  .maybeSingle()

setSaldo(wallet?.saldo_disponivel || 0)

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // 🔥 SE FOR ADMIN, REDIRECIONA
  if (profile?.role === "admin") {
    router.replace("/painelsantz") // ou sua rota admin real
    return
  }

  // 🔒 SOMENTE COMENTADOR CONTINUA
  const { data: missao } = await supabase
    .from("review_slots")
    .select("id, companies(nome, link_maps)")
    .eq("user_id", user.id)
    .eq("status", "reservado")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (missao) {
    setMissaoAtiva(true)
    setEmpresaAtiva(missao.companies)
    setSlotId(missao.id)
  } else {
    reset()
    fetchEmpresas()
  }
}
  async function fetchEmpresas() {
    setCarregandoEmpresas(true)

    const { data } = await supabase
  .from("vw_empresas_disponiveis")
  .select(`
    *,
    company_comment_templates (
      id
    )
  `)

      // ADICIONADO AQUI 30-03
      const { data: testeComentarios } = await supabase
  .from("companies")
  .select(`
    id,
    nome,
    company_comment_templates (
      id,
      texto,
      ativo
    )
  `)


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

    // 🔥 BUSCAR COMENTÁRIO DO SLOT (SEM USAR AINDA)
const { data: slotData } = await supabase
  .from("review_slots")
  .select(`
    id,
    template_id,
    company_comment_templates (
      id,
      texto
    )
  `)
  .eq("id", data)
  .single()


// salva no state (ainda não usamos)
setComentarioDoSlot(slotData?.company_comment_templates || null)

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
<header className="py-6 px-4 flex items-center justify-between">
  
  <img
    src="/icons/commenter1.png"
    alt="Commenter Pay"
    className="h-10 object-contain"
  />

  <div className="bg-[#111] px-4 py-3 rounded-2xl flex items-center gap-3 min-w-[180px]">
    <p className="text-xs text-gray-400 whitespace-nowrap">
      Saldo aprovado
    </p>

    <p className="text-green-400 font-bold text-lg">
      R$ {saldo.toFixed(2)}
    </p>
  </div>
</header>

{notificacao && (
<div
  key={notificacao}
  className="mx-4 mt-2 mb-4 bg-[#1a1a1a] border border-[#333] text-white text-sm px-4 py-3 rounded-xl flex items-center justify-between animate-popIn"
>
  <p className="text-gray-200">
    {notificacao}
  </p>

  <button
    onClick={() => {
      const atual = localStorage.getItem("som_notificacao")

      if (atual === "off") {
        localStorage.setItem("som_notificacao", "on")
        setSomAtivo(true)
      } else {
        localStorage.setItem("som_notificacao", "off")
        setSomAtivo(false)
      }
    }}
    className="text-xs px-3 py-1 rounded-full bg-[#2a2a2a] hover:bg-[#333] transition whitespace-nowrap"
  >
    {somAtivo ? "🔇 Silenciar Notificação" : "🔊 Ativar Notificação"}
  </button>

</div>  
 )}

            {/* 🔥 GRUPO VIP COMMENTERPAY (PRIORIDADE) */}
      <div className="mx-4 mb-4">
        <div className="bg-[#1f1f1f] border border-orange-500 rounded-2xl p-5">

          <p className="text-orange-400 font-bold text-sm text-center mb-2">
             🚀 Estamos em fase de testes 🔥
          </p>

          <p className="text-gray-300 text-xs text-center mb-4">
             Novas avaliações são liberadas em horários específicos.
             Entre no grupo para ser avisado primeiro e garantir suas vagas.
          </p>

          <a
            href="https://wa.link/sjoe8h"
            target="_blank"
            className="block w-full text-center bg-orange-500 hover:bg-orange-600 transition text-black font-bold py-3 rounded-xl text-sm"
          >
            ENTRAR NO GRUPO AGORA
          </a>
        </div>
      </div>

      {/* ⚙️ AVISO WHATSAPP (SECUNDÁRIO) */}
      {temWhatsapp === false && (
        <div className="mx-4 mb-6">
          <div className="bg-[#1a1a1a] border border-green-400/40 rounded-2xl p-4">

            <p className="text-green-400 font-semibold text-xs mb-1">
              Complete seu cadastro em 10 segundos
            </p>

            <p className="text-gray-400 text-xs mb-3">
              Cadastre seu WhatsApp para receber seus pagamentos e comprovantes direto no celular.
            </p>

            <button
              onClick={() => setMostrarModalZap(true)}
              className="w-full bg-green-400 text-black font-semibold py-2 rounded-xl text-sm"
            >
              Cadastrar WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* RESTANTE DO SEU DASHBOARD ORIGINAL SEGUE NORMAL AQUI */}


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
                <div className="flex items-center justify-between">
  <h2 className="font-semibold">{e.nome}</h2>

  {e.company_comment_templates?.length > 0 && (
    <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-yellow-500/60 text-yellow-400">
     EMPRESA PREMIUM
    </span>
  )}
</div>
                <p className="text-sm text-gray-400">
                  Vagas: {e.vagas_disponiveis}
                </p>


                <button
                  onClick={() => reservar(e)}
                  className="mt-4 w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
                >
                  Avaliar e Ganhar R${e.company_comment_templates?.length > 0 ? 4 : 3},00
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
  {/* INTRO */}
  {modoPopup === "intro" && (
    <>
      <h2 className="text-lg font-bold text-[#1DB954]">
  💰 Missão disponível
</h2>

<p className="text-sm text-gray-300">
  Você vai avaliar:
</p>

<p className="text-white font-semibold text-base">
  {empresaAtiva.nome}
</p>

<p className="text-sm text-gray-400">
  Siga o passo a passo para garantir seu pagamento de <b>R${empresaAtiva?.company_comment_templates?.length > 0 ? 4 : 3},00</b>
</p>

      <button
        onClick={() => {
          // 🔥 PRIORIDADE: usar comentário do slot (backend)
if (comentarioDoSlot) {
  setComentarioSelecionado(comentarioDoSlot)
  setCopiado(false)
  setModoPopup("tutorial")
  return
}

// fallback antigo (não remove)
const comentarios = empresaAtiva.company_comment_templates || []

          if (comentarios.length > 0) {
            const random =
              comentarios[Math.floor(Math.random() * comentarios.length)]

            setComentarioSelecionado(random)
            setCopiado(false)
            setModoPopup("tutorial")
          } else {
            window.open(empresaAtiva.link_maps, "_blank")
            setEtapa("idle")
          }
        }}
        className="w-full bg-[#1DB954] text-black py-3 rounded-full font-bold"
      >
        Continuar
      </button>
    </>
  )}

  {/* TUTORIAL */}
  {modoPopup === "tutorial" && comentarioSelecionado && (
    <>
      <h2 className="text-lg font-bold text-yellow-400">
  📋 Siga os passos
</h2>

<div className="text-sm text-gray-300 space-y-2 text-left">
  <p>1️⃣ Copie o comentário abaixo</p>
  <p>2️⃣ Abra a empresa no botão abaixo</p>
  <p>3️⃣ Cole exatamente o comentário</p>
  <p>4️⃣ Não altere o texto</p>
</div>

<div className="bg-[#111] border border-[#2a2a2a] p-2 rounded-xl text-xs text-gray-400">
  Empresa: <span className="text-white">{empresaAtiva.nome}</span>
</div>

<div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl text-sm text-white text-left">
  {comentarioSelecionado.texto}
</div>

      <button
  onClick={() => {
    navigator.clipboard.writeText(comentarioSelecionado.texto)
    setCopiado(true)
  }}
  className={`w-full py-2 rounded-xl font-bold transition ${
    copiado
      ? "bg-green-500 text-black"
      : "bg-yellow-400 text-black"
  }`}
>
  {copiado ? "✔ Comentário copiado!" : "Copiar comentário"}
</button>

      <button
        disabled={!copiado}
        onClick={() => {
          window.open(empresaAtiva.link_maps, "_blank")
          setEtapa("idle")
        }}
        className="w-full bg-green-500 text-black py-3 rounded-xl font-bold disabled:opacity-50"
      >
        {copiado ? "Iniciar Avaliaçã e Ganhar" : "Copie o comentário primeiro"}
      </button>
    </>
  )}
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
            Resgatar R${empresaAtiva?.company_comment_templates?.length > 0 ? 4 : 3},00
          </button>
        </Modal>
      )}
            {/* MODAL CADASTRAR WHATSAPP */}
      {mostrarModalZap && (
        <Modal>
          <h2 className="text-lg font-bold text-green-400">
            Cadastrar WhatsApp
          </h2>

          <input
            type="tel"
            maxLength={11}
            placeholder="DDD + número (ex: 11999999999)"
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(e.target.value.replace(/\D/g, ""))
            }
            className="w-full bg-[#2a2a2a] rounded-xl p-3 text-white text-center"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setMostrarModalZap(false)}
              className="flex-1 bg-gray-600 py-2 rounded-xl"
            >
              Cancelar
            </button>

            <button
              onClick={salvarWhatsapp}
              disabled={salvandoZap}
              className="flex-1 bg-green-400 text-black py-2 rounded-xl font-bold disabled:opacity-50"
            >
              {salvandoZap ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
      {/* 🔥 ZAP BUTTON */}
<a
  href="https://wa.me/82996265512"
  target="_blank"
  className="fixed bottom-24 right-4 bg-green-500 hover:bg-green-600 p-3 rounded-full shadow-lg z-50 flex items-center justify-center shadow-lg hover:scale-110 transition"
>
  <img
    src="/icons/zap.png"
    alt="WhatsApp"
    className="w-10 h-10"
  />
</a>
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
