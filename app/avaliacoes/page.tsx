"use client";

import React from "react";

export default function Avaliacoes() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111] flex justify-center px-4 py-10">
      {/* Wrapper responsivo */}
      <div className="w-full max-w-md bg-transparent">
        {/* Título */}
        <div className="flex flex-col items-center mb-6">
          {/* imagem depois virá de /public/estrela.png */}
          <div className="w-10 h-10 mb-2 flex items-center justify-center">
            <div className="w-6 h-6 bg-green-400" />
          </div>
          <h1 className="text-green-400 text-xl font-bold">Avaliações</h1>
        </div>

        {/* CONTAINER PRETO */}
<div className="bg-black rounded-2xl p-4 shadow-xl">
  {/* Header da lista */}
  <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 text-green-400 text-xs font-semibold mb-3 px-2">
    <span>Empresa</span>
    <span className="text-center">Link</span>
    <span className="text-right">Status</span>
  </div>

  {/* Itens */}
  <div className="space-y-3">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div
        key={item}
        className={`grid grid-cols-[1.5fr_1fr_1fr] gap-2 items-center rounded-xl px-4 py-3 text-green-400 text-sm bg-[#2a2a2a] ${
          item === 2 ? "border border-blue-600" : ""
        }`}
      >
        <span className="truncate">Empresa x</span>

        <span className="text-center underline cursor-pointer">
          Link
        </span>

        <span className="text-right text-xs font-semibold">
          PENDENTE
        </span>
      </div>
    ))}
  </div>
</div>


        {/* Botão */}
        <div className="flex justify-center mt-6">
          <button className="bg-green-400 text-black font-bold px-8 py-3 rounded-xl shadow-lg">
            FILTRAR POR DATA
          </button>
        </div>
      </div>
    </div>
  );
}
