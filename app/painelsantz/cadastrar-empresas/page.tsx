"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

/* TIPOS */
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
  total_usado: number
  total_aprovado: number
  total_em_analise: number
  ativa: boolean
  created_at: string
}

export default function AdminEmpresas() {
  const [aba, setAba] = useState<Aba>("cadastrar")

  /* cadastrar */
  const [nome, setNome] = useState("")
  const [link, setLink] = useState("")
  const [pacote, setPacote] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  /* listas */
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([])
  const [loadingLista, setLoadingLista] = useState(false)

  useEffect(() => {
    if (aba !== "cadastrar") carregarEmpresas()
  }, [aba])

  async function cadastrarEmpresa() {
    setErro(null)
    setSucesso(false)

    if (!nome || !link || !pacote) {
      setErro("Preencha todos os campos")
      return
    }

    setLoading(true)

    const { error } = await supabase.rpc("admin_create_company", {
      p_nome: nome,
      p_link_maps: link,
      p_pacote_limite: pacote,
    })

    setLoading(false)

    if (error) {
      setErro(error.message)
      return
    }

    setNome("")
    setLink("")
    setPacote("")
    setSucesso(true)
  }

  async function carregarEmpresas() {
    setLoadingLista(true)

    const view =
      aba === "cadastradas"
        ? "vw_admin_companies_all"
        : aba === "espera"
        ? "vw_admin_companies_em_espera"
        : "vw_admin_companies_concluidas"

    const { data, error } = await supabase.from(view).select("*")

    setLoadingLista(false)

    if (!error) setEmpresas(data || [])
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-8">

      {/* TABS */}
      <div className="flex gap-3 mb-10 flex-wrap">
        <Tab label="Cadastrar" ativo={aba === "cadastrar"} onClick={() => setAba("cadastrar")} />
        <Tab label="Cadastradas" ativo={aba === "cadastradas"} onClick={() => setAba("cadastradas")} />
        <Tab label="Empresas em Espera" ativo={aba === "espera"} onClick={() => setAba("espera")} />
        <Tab label="Empresas Concluídas" ativo={aba === "concluidas"} onClick={() => setAba("concluidas")} />
      </div>

      {/* CADASTRAR */}
      {aba === "cadastrar" && (
        <div className="bg-black rounded-2xl p-6 max-w-md space-y-4">
          <Input placeholder="Nome da empresa" value={nome} onChange={setNome} />
          <Input placeholder="Link Google Maps" value={link} onChange={setLink} />
          <Input
            placeholder="Pacote de avaliações"
            value={pacote}
            type="number"
            onChange={(v) => setPacote(Number(v))}
          />

          {erro && (
            <div className="bg-red-900/40 border border-red-500 rounded-xl p-3 text-sm">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-900/40 border border-green-500 rounded-xl p-3 text-sm">
              ✅ Empresa cadastrada com sucesso
            </div>
          )}

          <button
            onClick={cadastrarEmpresa}
            disabled={loading}
            className="w-full bg-green-500 text-black font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastrar empresa"}
          </button>
        </div>
      )}

      {/* LISTAS */}
      {aba !== "cadastrar" && (
        <div className="space-y-4">
          {loadingLista ? (
            <p className="text-gray-400">Carregando empresas…</p>
          ) : empresas.length === 0 ? (
            <p className="text-gray-500">Nenhuma empresa encontrada</p>
          ) : (
            empresas.map((e) => (
              <div
                key={e.id}
                className="bg-black border border-[#2a2a2a] rounded-xl p-4 text-sm space-y-1"
              >
                <p className="font-semibold text-blue-400">{e.nome}</p>

                {/* HISTÓRICO */}
                {aba === "cadastradas" ? (
                  <>
                    <p className="text-gray-400">
                      Pacote contratado: {e.pacote_limite}
                    </p>

                    <a
                      href={e.link_maps}
                      target="_blank"
                      className="text-green-400 underline text-sm"
                    >
                      Ver no Google Maps
                    </a>

                    <p className="text-gray-500 text-xs">
                      Cadastrada em{" "}
                      {new Date(e.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400">
                      Vagas disponíveis: {e.vagas_disponiveis}
                    </p>
                    <p className="text-gray-400">
                      Aprovadas: {e.total_aprovado}
                    </p>
                    <p className="text-gray-400">
                      Em análise: {e.total_em_analise}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* COMPONENTES */

function Tab({
  label,
  ativo,
  onClick,
}: {
  label: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
        ativo
          ? "bg-[#1c1c1c] text-blue-400"
          : "bg-[#1a1a1a] text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  )
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string
  value: any
  onChange: (v: any) => void
  type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-green-500"
    />
  )
}
