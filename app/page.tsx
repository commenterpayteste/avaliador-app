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
    queryParams: {
      prompt: "select_account"
    }
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


        <h1 className="text-2xl font-extrabold text-center leading-tight">
  Ganhe dinheiro{" "}
  <span className="text-green-500">avaliando empresas</span>{" "}
  no{" "}
<span className="font-bold">
  <span className="text-[#4285F4]">G</span>
  <span className="text-[#EA4335]">o</span>
  <span className="text-[#FBBC05]">o</span>
  <span className="text-[#4285F4]">g</span>
  <span className="text-[#34A853]">l</span>
  <span className="text-[#EA4335]">e</span>
</span>
</h1>

<p className="text-gray-400 text-sm mt-2 text-center">
  Sem taxa, sem mensalidade e sem enrolação.
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

<div className="text-center text-xs text-yellow-400 mb-4">
  ⚠️ Restam poucas vagas para novos usuários hoje
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
        className="w-full max-w-sm bg-green-500 hover:bg-green-600 transition text-black font-bold py-4 rounded-xl btn-glow active:scale-95"
      >
        COMEÇAR E GANHAR AGORA
      </button>

<div className="w-full max-w-sm mt-6">
  <p className="text-sm text-gray-400 mb-3 text-center">
    Pagamentos reais acontecendo agora
  </p>

  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar px-2">

    <img
      src="/provas/1.jpeg"
      className="w-full max-w-[260px] flex-shrink-0 snap-center rounded-2xl border border-[#222]"
    />

    <img
      src="/provas/2.jpeg"
      className="w-full max-w-[260px] flex-shrink-0 snap-center rounded-2xl border border-[#222]"
    />

    <img
      src="/provas/3.jpeg"
      className="w-full max-w-[260px] flex-shrink-0 snap-center rounded-2xl border border-[#222]"
    />

        <img
      src="/provas/4.jpeg"
      className="w-full max-w-[260px] flex-shrink-0 snap-center rounded-2xl border border-[#222]"
    />

  </div>
</div>

<div className="w-full max-w-sm bg-[#111] border border-green-500/30 rounded-xl p-3 text-center mt-4">
  <p className="text-sm text-gray-300">
    🚀 Acesso liberado para novos usuários
  </p>
  <p className="text-xs text-gray-400 mt-1">
    Entre no grupo para ver resultados e tirar dúvidas 👇
  </p>

  <a
    href="https://wa.link/sjoe8h"
    target="_blank"
    className="mt-3 block bg-green-500 text-black font-semibold py-2 rounded-lg"
  >
    Entrar no grupo
  </a>
</div>

<p className="text-xs text-gray-400 mt-3">
  Prefere começar direto?
</p>

<button
  onClick={handleComecar}
  className="mt-2 w-full border border-green-500 text-green-400 font-semibold py-2 rounded-lg"
>
  COMEÇAR AGORA
</button>

    </div>
  )
}
