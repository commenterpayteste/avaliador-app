"use client"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Admin() {
  const [comentarios, setComentarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [imagemAtiva, setImagemAtiva] = useState<string | null>(null)
  const [aba, setAba] = useState<"pendentes" | "aprovadas" | "recusadas">("pendentes")
  const [busca, setBusca] = useState("")
  const router = useRouter()

  useEffect(() => {
    verificarAdmin()
  }, [])

useEffect(() => {
  function handleEsc(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setImagemAtiva(null)
    }
  }

  window.addEventListener("keydown", handleEsc)

  return () => {
    window.removeEventListener("keydown", handleEsc)
  }
}, [])

  async function verificarAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("email")
      .eq("email", user.email)
      .maybeSingle()

    if (!admin) {
      await supabase.auth.signOut()
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from("vw_admin_comentarios")
      .select("*")
      .order("data_envio", { ascending: false })

    setComentarios(data || [])
    setLoading(false)
  }

  const aprovar = async (
  slotId: string,
  motivo?: string
) => {
    const { error } = await supabase.rpc("aprovar_comentario", {
      p_slot_id: slotId,
      p_valor: 3,
p_motivo: motivo || null,
    })

    if (error) {
      alert(error.message)
      return
    }

    verificarAdmin()
  }

  const recusar = async (
  slotId: string,
  motivo?: string
) => {
    const ok = confirm("Tem certeza que deseja recusar este comentário?")
    if (!ok) return

    const { error } = await supabase.rpc("recusar_comentario", {
  p_slot_id: slotId,
  p_motivo: motivo || null,
})

    if (error) {
      alert(error.message)
      return
    }

    verificarAdmin()
  }

  // 🔥 FILTROS (AGORA SEM QUEBRAR HOOKS)
  const pendentes = comentarios.filter(c => c.status === "enviado")
  const aprovadas = comentarios.filter(c => c.status === "aprovado")
  const recusadas = comentarios.filter(c => c.status === "recusado")

  const listaBase =
    aba === "pendentes"
      ? pendentes
      : aba === "aprovadas"
      ? aprovadas
      : recusadas

  const lista = useMemo(() => {
    return listaBase.filter(c =>
      c.usuario?.toLowerCase().includes(busca.toLowerCase()) ||
      c.email_usuario?.toLowerCase().includes(busca.toLowerCase())
    )
  }, [listaBase, busca])

  const hoje = new Date().toDateString()

  if (loading) {
    return <div className="text-center text-white p-10">Carregando…</div>
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-10 space-y-8">

      {/* ABAS */}
      <div className="flex gap-4">
        <Tab label={`Pendentes (${pendentes.length})`} active={aba==="pendentes"} onClick={()=>setAba("pendentes")} />
        <Tab label={`Aprovadas (${aprovadas.length})`} active={aba==="aprovadas"} onClick={()=>setAba("aprovadas")} />
        <Tab label={`Recusadas (${recusadas.length})`} active={aba==="recusadas"} onClick={()=>setAba("recusadas")} />
      </div>

      {/* BUSCA */}
      <input
        placeholder="Buscar por nome ou email..."
        value={busca}
        onChange={(e)=>setBusca(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#222] rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition"
      />

      {/* CARDS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {lista.map((c) => {

console.log(c)
          const ehNovo = new Date(c.data_envio).toDateString() === hoje

          return (
            <div
              key={c.slot_id}
              className="bg-[#141414] border border-[#222] rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
            >

              {c.review_image_url && (
                <img
                  src={c.review_image_url}
                  onClick={()=>setImagemAtiva(c.review_image_url)}
                  className="w-full h-56 object-cover cursor-pointer"
                />
              )}

              <div className="p-6 space-y-4">

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{c.usuario}</h3>
                    <p className="text-sm text-gray-400">{c.empresa}</p>
                  </div>

                  {ehNovo && (
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-3 py-1 rounded-full">
                      Novo Hoje
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-400 space-y-1">
  <p>Email: {c.email_usuario}</p>

  {c.whatsapp && (
    <p>WhatsApp: {c.whatsapp}</p>
  )}

  <p>
    Data: {new Date(c.data_envio).toLocaleString("pt-BR")}
  </p>
</div>

                {c.status === "enviado" ? (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
  const ok = confirm("Tem certeza que deseja APROVAR este comentário?")
  if (!ok) return

  const motivo = prompt(
    "Observação da aprovação (opcional):"
  )

  aprovar(c.slot_id, motivo || undefined)
}}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-xl font-semibold"
                    >
                      Aprovar
                    </button>

                    <button
                     onClick={() => {
  const motivo = prompt(
    "Motivo da recusa:"
  )

  if (!motivo) return

  recusar(c.slot_id, motivo)
}}
                      className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-xl font-semibold"
                    >
                      Recusar
                    </button>
                  </div>
                ) : (
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      c.status === "aprovado"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {c.status === "aprovado" ? "✔ Aprovado" : "✖ Recusado"}
                  </span>
                )}

              </div>
            </div>
          )
        })}

      </div>

      {imagemAtiva && (
      <div
  onClick={() => setImagemAtiva(null)}
  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-pointer"
>

<button
  onClick={() => setImagemAtiva(null)}
  className="absolute top-6 right-6 text-white text-4xl font-bold hover:scale-110 transition"
>
  ×
</button>

          <img
  src={imagemAtiva}
  onClick={(e) => e.stopPropagation()}
  className="max-w-4xl max-h-[80vh] object-contain rounded-xl"
/>
        </div>
      )}

    </div>
  )
}

function Tab({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-orange-500 text-black"
          : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222]"
      }`}
    >
      {label}
    </button>
  )
}