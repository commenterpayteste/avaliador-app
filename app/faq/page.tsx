"use client"

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 space-y-4">

      <h1 className="text-lg font-bold">Dúvidas Frequentes</h1>

      {/* ITEM */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <p className="font-semibold">💸 Como posso ganhar mais?</p>
        <p className="text-sm text-gray-400 mt-1">
          Basta entrar no nosso Grupo onde avisamos sobre empresas que pagam mais.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <p className="font-semibold">💰 Como funciona?</p>
        <p className="text-sm text-gray-400 mt-1">
          Você avalia empresas no Google, nossa equipe vai analisar quando você enviar, e você ganha por cada avaliação aprovada.
        </p>
      </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <p className="font-semibold">💸 Como recebo meu pagamento?</p>
        <p className="text-sm text-gray-400 mt-1">
          Via PIX cadastrado por você após avaliar ou em "Dados". vá em ganhos e solicite um saque, ou receba automaticamente todas ás 16:00
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <p className="font-semibold">⏳ Quanto tempo demora pra aprovar o comentário?</p>
        <p className="text-sm text-gray-400 mt-1">
          Quando você avalia uma empresa, iremos aprovar o comentário em alguns minutos e seu dinheiro fica liberado.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <p className="font-semibold">⚠️ Posso ser bloqueado?</p>
        <p className="text-sm text-gray-400 mt-1">
          Sim, se você fazer comentários negativos ou tentar burlar o sistema, perderá acesso a conta.
        </p>
      </div>


    </div>
  )
}