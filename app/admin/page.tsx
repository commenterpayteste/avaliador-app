"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Admin() {
  const [comentarios, setComentarios] = useState<any[]>([])

  useEffect(() => {
    supabase.from("vw_admin_comentarios").select("*").then(({ data }) => {
      setComentarios(data || [])
    })
  }, [])

  const aprovar = async (slotId: string) => {
    await supabase.rpc("aprovar_comentario", { p_slot_id: slotId, p_valor: 3 })
    location.reload()
  }

  return (
    <div className="p-6 space-y-4">
      {comentarios.map((c) => (
        <div key={c.slot_id} className="border p-4 rounded">
          <p><b>{c.usuario}</b> → {c.empresa}</p>
          <a href={c.review_link} target="_blank">Ver comentário</a>
          <button onClick={() => aprovar(c.slot_id)} className="bg-green-600 text-white px-4 py-2 ml-4 rounded">
            Aprovar
          </button>
          <button
  onClick={async () => {
    const ok = confirm("Recusar este comentário?")
    if (!ok) return

    const { error } = await supabase.rpc("recusar_comentario", {
      p_slot_id: c.slot_id,
    })

    if (error) {
      alert(error.message)
      return
    }

    alert("Comentário recusado e vaga liberada")
    location.reload()
  }}
  className="bg-red-600 text-white px-4 py-2 rounded ml-2"
>
  Recusar
</button>

        </div>
      ))}
    </div>
  )
}
