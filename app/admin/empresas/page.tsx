"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

/* =========================
   TIPOS
========================= */

type Aba =
  | "cadastrar"
  | "cadastradas"
  | "espera"
  | "concluidas"

type EmpresaAdmin = {
  id: string
  nome: string
  link_maps: string
  pacote_limite: number
  vagas_disponiveis: number
  limite_diario: number
  total_usado: number
  total_aprovado: number
  total_em_analise: number
  ativa: boolean
  created_at: string
}

type ConfirmModal = {
  titulo: string
  descricao: string
  onConfirm: () => Promise<void> | void
  onCancel?: () => void
}

type InputProps = {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */

export default function AdminEmpresas() {
  const [aba, setAba] = useState<Aba>("cadastrar")

  /* cadastro */
  const [nome, setNome] = useState("")
  const [link, setLink] = useState("")
  const [pacote, setPacote] = useState<number | "">("")
  const [limiteDiario, setLimiteDiario] = useState<number | "">("")
  const [ativaNova, setAtivaNova] = useState(true)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  /* edição */
  const [editando, setEditando] = useState<EmpresaAdmin | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  /* confirmação */
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null)

  /* lista */
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([])
  
/* comentários personalizados mudei aqui*/
const [comentariosAtivos, setComentariosAtivos] = useState(false)
const [comentarios, setComentarios] = useState<string[]>([])

  useEffect(() => {
    if (aba !== "cadastrar") carregarEmpresas()
  }, [aba])

  /* =========================
     CADASTRAR
  ========================= */

  async function cadastrarEmpresa() {
    setErro(null)
    setSucesso(false)

    if (!nome || !link || !pacote || !limiteDiario) {
      setErro("Preencha todos os campos")
      return
    }
setConfirmModal({
  titulo: "Confirmar criação",
  descricao: `
📌 Empresa: ${nome}

🔗 Link:
${link}

📦 Pacote total: ${pacote}
📊 Limite diário: ${limiteDiario}

💬 Comentários personalizados: ${
  comentariosAtivos
    ? `${comentarios.filter(c => c.trim() !== "").length} comentário(s)`
    : "Não"
}

${
  comentariosAtivos && comentarios.length > 0
    ? "📝 Lista:\n" +
      comentarios
        .filter(c => c.trim() !== "")
        .map((c, i) => `${i + 1}. ${c}`)
        .join("\n")
    : ""
}
`,
  onConfirm: async () => {
    setLoading(true)

    const { data: companyId, error } = await supabase.rpc("admin_create_company", {
      p_nome: nome,
      p_link_maps: link,
      p_pacote_limite: pacote,
      p_limite_diario: limiteDiario,
      p_ativa: ativaNova,
    })

    setLoading(false)
    setConfirmModal(null)

    if (error) {
      setErro(error.message)
      return
    }

    // 🔥 SALVAR COMENTÁRIOS
    if (companyId && comentariosAtivos && comentarios.length > 0) {
      const comentariosValidos = comentarios.filter(c => c.trim() !== "")

      const payload = comentariosValidos.map(c => ({
        company_id: companyId,
        texto: c.trim(),
        ativo: true
      }))

      await supabase
        .from("company_comment_templates")
        .insert(payload)
    }

    setNome("")
    setLink("")
    setPacote("")
    setLimiteDiario("")
    setAtivaNova(true)
    setSucesso(true)
    setComentarios([])
    setComentariosAtivos(false)
  },
})
}

  /* =========================
     EDITAR
  ========================= */

  function atualizarEmpresa() {
    if (!editando) return

    const empresaTemp = { ...editando }

    // FECHA modal editar antes
    setEditando(null)

    setConfirmModal({
      titulo: "Confirmar alteração",
      descricao: `Novo pacote: ${empresaTemp.pacote_limite}\nNovo limite diário: ${empresaTemp.limite_diario}`,
      onConfirm: async () => {
        setLoadingEdit(true)

        const { error } = await supabase.rpc("admin_update_company", {
          p_id: empresaTemp.id,
          p_nome: empresaTemp.nome,
          p_link_maps: empresaTemp.link_maps,
          p_pacote_limite: empresaTemp.pacote_limite,
          p_limite_diario: empresaTemp.limite_diario,
          p_ativa: empresaTemp.ativa,
        })

        setLoadingEdit(false)
        setConfirmModal(null)

        if (!error) {
          carregarEmpresas()
        }
      },
      onCancel: () => {
        setConfirmModal(null)
        setEditando(empresaTemp) // reabre editar se cancelar
      },
    })
  }

  /* =========================
     CARREGAR LISTA
  ========================= */

  async function carregarEmpresas() {
    const view =
      aba === "cadastradas"
        ? "vw_admin_companies_all"
        : aba === "espera"
        ? "vw_admin_companies_em_espera"
        : "vw_admin_companies_concluidas"

    const { data } = await supabase.from(view).select("*")
    setEmpresas(data || [])
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Painel de Empresas
        </h1>

        {/* TABS */}
        <div className="flex gap-3 mb-10 flex-wrap">
          <Tab label="Cadastrar" ativo={aba === "cadastrar"} onClick={() => setAba("cadastrar")} />
          <Tab label="Cadastradas" ativo={aba === "cadastradas"} onClick={() => setAba("cadastradas")} />
          <Tab label="Em Espera" ativo={aba === "espera"} onClick={() => setAba("espera")} />
          <Tab label="Concluídas" ativo={aba === "concluidas"} onClick={() => setAba("concluidas")} />
        </div>

        {/* CADASTRO */}
        {aba === "cadastrar" && (
          
          <div className="bg-[#161a21] border border-[#222] rounded-2xl p-8 max-w-lg shadow-xl space-y-5">
            <Input label="Nome da empresa" value={nome} onChange={setNome} />
            <Input label="Link Google Maps" value={link} onChange={setLink} />
            <Input label="Pacote total" type="number" value={pacote} onChange={(v) => setPacote(Number(v))} />
            <Input label="Limite diário" type="number" value={limiteDiario} onChange={(v) => setLimiteDiario(Number(v))} />

{/* COMENTÁRIOS PERSONALIZADOS MEXI AQUI*/}
<div className="bg-[#1c1f26] border border-[#2a2a2a] rounded-xl p-4 space-y-3">

  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-300">
      Usar comentários personalizados
    </span>

    <button
      type="button"
      onClick={() => setComentariosAtivos(!comentariosAtivos)}
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        comentariosAtivos
          ? "bg-green-500 text-black"
          : "bg-gray-600 text-white"
      }`}
    >
      {comentariosAtivos ? "Ativo" : "Desligado"}
    </button>
  </div>

  {comentariosAtivos && (
    <div className="space-y-2">
      {comentarios.map((c, i) => (
        <input
          key={i}
          value={c}
          onChange={(e) => {
            const novos = [...comentarios]
            novos[i] = e.target.value
            setComentarios(novos)
          }}
          placeholder={`Comentário ${i + 1}`}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm"
        />
      ))}

      <button
        type="button"
        onClick={() => setComentarios([...comentarios, ""])}
        className="text-xs text-green-400"
      >
        + adicionar comentário
      </button>
    </div>
  )}
</div>
            {erro && <Alert color="red" text={erro} />}
            {sucesso && <Alert color="green" text="Empresa cadastrada com sucesso" />}

            {/* STATUS CRIAR */}
            <div className="flex items-center justify-between bg-[#1c1f26] border border-[#2a2a2a] rounded-xl px-4 py-3">
              <span className="text-sm text-gray-300">Empresa ativa</span>
              <button
                onClick={() => setAtivaNova(!ativaNova)}
                type="button"
                className={`px-4 py-1 rounded-full text-xs font-semibold transition ${
                  ativaNova
                    ? "bg-green-500 text-black"
                    : "bg-red-500 text-black"
                }`}
              >
                {ativaNova ? "Ativa" : "Inativa"}
              </button>
            </div>

            <button
              onClick={cadastrarEmpresa}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 transition text-black font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar empresa"}
            </button>
          </div>
        )}

        {/* LISTA */}
        {aba !== "cadastrar" && (
          <div className="grid md:grid-cols-2 gap-6">
            {empresas.map((e) => (
              <div key={e.id} className="bg-[#161a21] border border-[#222] rounded-2xl p-6 shadow-md">

                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg">{e.nome}</h2>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    e.ativa ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {e.ativa ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <p>Pacote: {e.pacote_limite}</p>
                  <p>Limite diário: {e.limite_diario}</p>
                  <p>Disponíveis: {e.vagas_disponiveis}</p>
                  <p>Aprovadas: {e.total_aprovado}</p>
                </div>

                <button
                  onClick={() => setEditando(e)}
                  className="mt-5 w-full bg-[#222] hover:bg-[#2a2a2a] transition py-2 rounded-xl text-sm"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL CONFIRMAÇÃO */}
      {confirmModal && (
        <Modal>
          <h2 className="text-xl font-bold">{confirmModal.titulo}</h2>
          <p className="text-gray-400 whitespace-pre-line text-sm">
            {confirmModal.descricao}
          </p>
          <div className="flex gap-3 pt-3">
            <button
              onClick={() =>
                confirmModal.onCancel
                  ? confirmModal.onCancel()
                  : setConfirmModal(null)
              }
              className="flex-1 bg-[#2a2a2a] py-2 rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={confirmModal.onConfirm}
              className="flex-1 bg-green-500 text-black font-bold py-2 rounded-xl"
            >
              Confirmar
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL EDITAR */}
      {editando && (
        <Modal>
          <h2 className="text-xl font-bold mb-2">Editar empresa</h2>

          <Input label="Nome" value={editando.nome} onChange={(v) => setEditando({ ...editando, nome: v })} />
          <Input label="Link" value={editando.link_maps} onChange={(v) => setEditando({ ...editando, link_maps: v })} />
          <Input label="Pacote" type="number" value={editando.pacote_limite} onChange={(v) => setEditando({ ...editando, pacote_limite: Number(v) })} />
          <Input label="Limite diário" type="number" value={editando.limite_diario} onChange={(v) => setEditando({ ...editando, limite_diario: Number(v) })} />

          {/* STATUS EDITAR */}
          <div className="flex items-center justify-between bg-[#1c1f26] border border-[#2a2a2a] rounded-xl px-4 py-3 mt-2">
            <span className="text-sm text-gray-300">Empresa ativa</span>
            <button
              onClick={() =>
                setEditando({
                  ...editando,
                  ativa: !editando.ativa,
                })
              }
              type="button"
              className={`px-4 py-1 rounded-full text-xs font-semibold transition ${
                editando.ativa
                  ? "bg-green-500 text-black"
                  : "bg-red-500 text-black"
              }`}
            >
              {editando.ativa ? "Ativa" : "Inativa"}
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setEditando(null)} className="flex-1 bg-[#2a2a2a] py-2 rounded-xl">
              Cancelar
            </button>
            <button onClick={atualizarEmpresa} disabled={loadingEdit} className="flex-1 bg-green-500 text-black font-bold py-2 rounded-xl">
              {loadingEdit ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* =========================
   COMPONENTES AUX
========================= */

function Tab({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
        ativo
          ? "bg-[#1f2937] text-green-400"
          : "bg-[#1a1a1a] text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  )
}

function Input({ label, value, onChange, type = "text" }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        className="w-full bg-[#1c1f26] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-green-500 transition"
      />
    </div>
  )
}

function Alert({ color, text }: { color: "red" | "green"; text: string }) {
  return (
    <div
      className={`p-3 rounded-xl text-sm border ${
        color === "red"
          ? "bg-red-500/10 border-red-500 text-red-400"
          : "bg-green-500/10 border-green-500 text-green-400"
      }`}
    >
      {text}
    </div>
  )
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
      <div className="bg-[#161a21] border border-[#222] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
        {children}
      </div>
    </div>
  )
}