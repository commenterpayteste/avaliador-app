"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Admin() {
  const [comentarios, setComentarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [imagemAtiva, setImagemAtiva] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    verificarAdmin()
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

  const aprovar = async (slotId: string) => {
    const { error } = await supabase.rpc("aprovar_comentario", {
      p_slot_id: slotId,
      p_valor: 3,
    })

    if (error) {
      alert(error.message)
      return
    }

    verificarAdmin()
  }

  const recusar = async (slotId: string) => {
    const ok = confirm("Recusar este comentário?")
    if (!ok) return

    const { error } = await supabase.rpc("recusar_comentario", {
      p_slot_id: slotId,
    })

    if (error) {
      alert(error.message)
      return
    }

    verificarAdmin()
  }

  if (loading) {
    return <div className="text-center text-white p-10">Carregando…</div>
  }

  const pendentes = comentarios.filter(c => c.status === "enviado").length
  const aprovadas = comentarios.filter(c => c.status === "aprovado").length
  const recusadas = comentarios.filter(c => c.status === "recusado").length

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-10 space-y-10">

      {/* CONTADORES */}
      <div className="flex justify-center gap-6">
        <Badge label={`${pendentes} pendentes`} color="orange" />
        <Badge label={`${aprovadas} aprovadas`} color="green" />
        <Badge label={`${recusadas} recusadas`} color="red" />
      </div>

      {/* WIDGET */}
      <div className="bg-black rounded-3xl p-6 shadow-2xl">

        <div className="grid grid-cols-6 text-xs text-gray-400 mb-4 px-2">
          <span>Usuário</span>
          <span>Email</span>
          <span>Empresa</span>
          <span>Data / Hora</span>
          <span>ID Usuário</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="space-y-3">
          {comentarios.map((c) => (
            <div
              key={c.slot_id}
              className="grid grid-cols-6 items-center bg-[#181818] rounded-xl px-4 py-3 text-sm"
            >
              <span>{c.usuario}</span>
              <span className="truncate">{c.email_usuario}</span>
              <span>{c.empresa}</span>
              <span className="text-xs text-gray-400">
                {new Date(c.data_envio).toLocaleString("pt-BR")}
              </span>
              <span className="text-xs truncate">{c.user_id}</span>

              {/* AÇÕES */}
              <div className="flex justify-end gap-2 items-center">

                {c.review_image_url && (
                  <img
                    src={c.review_image_url}
                    onClick={() => setImagemAtiva(c.review_image_url)}
                    className="w-10 h-10 object-cover rounded cursor-pointer border border-gray-600"
                    title="Clique para ampliar"
                  />
                )}

                {c.status === "enviado" ? (
                  <>
                    <button
                      onClick={() => aprovar(c.slot_id)}
                      className="bg-green-600 px-3 py-1 rounded-md"
                    >
                      Aprovar
                    </button>

                    <button
                      onClick={() => recusar(c.slot_id)}
                      className="bg-red-600 px-3 py-1 rounded-md"
                    >
                      Rejeitar
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    {c.status === "aprovado"
                      ? "✔ Aprovado"
                      : "✖ Recusado"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL IMAGEM */}
      {imagemAtiva && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full px-4">
            <button
              onClick={() => setImagemAtiva(null)}
              className="absolute -top-10 right-4 text-white"
            >
              ✕ Fechar
            </button>

            <img
              src={imagemAtiva}
              className="w-full max-h-[80vh] object-contain rounded-xl border border-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  const colors: any = {
    orange: "text-orange-400",
    green: "text-green-500",
    red: "text-red-500",
  }

  return (
    <div className={`px-6 py-2 rounded-full bg-black ${colors[color]}`}>
      {label}
    </div>
  )
}
