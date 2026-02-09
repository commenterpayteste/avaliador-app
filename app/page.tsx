"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const router = useRouter()

  async function handleComecar() {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      router.push("/dashboard")
      return
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] flex flex-col items-center justify-between py-10 px-6 text-white">

      {/* LOGO */}
      <div className="text-center space-y-2">
        <img
          src="/icons/commenter1.png"
          alt="Commenter Pay"
          className="h-20 mx-auto object-contain"
        />

        <p className="text-gray-300 text-sm">
          Aprenda em 15 segundos
        </p>
      </div>

      {/* VSL */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden my-6 bg-black">
        <div className="relative w-full pt-[177%]"> 
          {/* 9:16 (vertical, mobile first) */}
          <iframe
            src="https://player-vz-c9c39116-458.tv.pandavideo.com.br/embed/?v=b8ec25a8-2d70-4184-abdb-9a16a18b6d34"
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* WIDGET CONFIANÇA */}
      <div className="w-full max-w-sm bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-4 mb-6 space-y-3">

        <div className="flex items-center justify-between text-sm">
          <span className="text-green-400 font-semibold">
            ✔ Avaliou → Ganhou
          </span>
          <span className="text-gray-400">
            Pagamento real
          </span>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>Sem taxas</span>
          <span>Sem mensalidade</span>
          <span>Sem pegadinhas</span>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 border-t border-[#1f1f1f]">
          <img src="/icons/google.svg" alt="Google" className="w-4 h-4" />
          Empresas verificadas pelo Google • 2026
        </div>
      </div>

      {/* BOTÃO */}
      <button
        onClick={handleComecar}
        className="w-full max-w-sm bg-green-500 hover:bg-green-600 transition text-black font-bold py-4 rounded-xl"
      >
        Começar a avaliar
      </button>
    </div>
  )
}
