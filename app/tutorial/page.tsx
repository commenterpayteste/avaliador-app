"use client"

import { useRouter } from "next/navigation"

export default function TutorialPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-md space-y-6">

        {/* VOLTAR */}
        <button
          onClick={() => router.back()}
          className="text-green-400 text-sm font-semibold"
        >
          ← Voltar
        </button>

        {/* HERO */}
        <div className="bg-[#0d0d0d] border border-green-500/20 rounded-3xl p-6 space-y-3">
          <h1 className="text-3xl font-black leading-tight">
            🎥 Aprenda a evitar remoções do Google
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed">
            Perfis de melhor qualidade possuem maior taxa de aprovação.
          </p>
        </div>

        {/* VIDEO */}
<div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-4 space-y-3">

  <div>
    <h2 className="text-lg font-bold text-green-400">
      🎥 Assista antes de comentar
    </h2>

    <p className="text-sm text-gray-400 mt-1">
      Aprenda rapidamente como evitar remoções do Google.
    </p>
  </div>

  <div className="overflow-hidden rounded-2xl">
    <div className="aspect-square">
      <iframe
        src="https://player-vz-c9c39116-458.tv.pandavideo.com.br/embed/?v=7ee8b8dc-3b78-4188-ac78-f07398161122"
        className="w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>

</div>

        {/* PERFIL IDEAL */}
        <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-5 space-y-4">
          <h2 className="text-xl font-bold text-green-400">
            🟢 Para ter comentários aprovados:  
          </h2>

          <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>✔ Nome e sobrenome reais</li>
            <li>✔ Foto de perfil na conta Google</li>
            <li>✔ Conta antiga possui maior confiança</li>
            <li>✔ Contas com atividade possuem maior taxa de aprovação</li>
          </ul>
        </div>

        {/* COMENTÁRIOS */}
        <div className="grid gap-4">

          <div className="bg-[#1a0f0f] border border-red-500/20 rounded-3xl p-5">
            <h2 className="text-red-400 font-bold mb-3">
              ❌ Proibido Editar comentário
            </h2>

            <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <li>X Não edite comentários após publicar</li>
            <li>X Usar uma conta que você já comentou e editar o comentário</li>
            <li>X Usar mesma conta pra comentar na mesma empresa</li>
          </ul>
          </div>

        </div>

        {/* ALERTA */}
        <div className="bg-[#151515] border border-yellow-500/20 rounded-3xl p-5 space-y-3">
          <h2 className="text-yellow-400 font-bold">
            ⚠️ Evite comportamento em massa
          </h2>

          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Não comente várias empresas seguidas</li>
            <li>• Evite contas recém criadas</li>
            <li>• Navegue no Google Maps antes de comentar</li>
            <li>• Comentários naturais possuem maior permanência</li>
          </ul>
        </div>

    

        {/* BOTÃO */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-green-400 text-black font-bold py-4 rounded-2xl"
        >
          Voltar para dashboard
        </button>

      </div>
    </div>
  )
}