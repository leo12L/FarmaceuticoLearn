"use client";

import { useState } from "react";

// Calculadora de dosis rápida del mockup. Es una demo educativa: sugiere una
// dosis inicial orientativa a partir de una pauta genérica por peso. NO es una
// recomendación clínica.
const MG_POR_KG = 15; // pauta genérica de ejemplo (p. ej. paracetamol 10-15 mg/kg)
const DOSIS_MAX_MG = 1000;

export default function CalculadoraDosis() {
  const [peso, setPeso] = useState("");
  const [edad, setEdad] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);

  function sugerir() {
    const kg = Number(peso);
    if (!kg || kg <= 0) {
      setResultado("Introduce un peso válido.");
      return;
    }
    const dosis = Math.min(Math.round(kg * MG_POR_KG), DOSIS_MAX_MG);
    setResultado(`≈ ${dosis} mg por toma (${MG_POR_KG} mg/kg, máx. ${DOSIS_MAX_MG} mg)`);
  }

  return (
    <div className="rounded-tarjeta border border-borde bg-marca-tenue/60 p-5 shadow-suave">
      <h3 className="font-semibold text-marca">Calculadora de Dosis Rápida</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-tenue">
            Peso (kg)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="70"
            className="tabular w-full rounded-lg border border-borde bg-surface px-3 py-2 text-sm outline-none focus:border-marca"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-tenue">
            Edad
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            placeholder="45"
            className="tabular w-full rounded-lg border border-borde bg-surface px-3 py-2 text-sm outline-none focus:border-marca"
          />
        </label>
      </div>

      <button
        onClick={sugerir}
        className="mt-3 w-full rounded-lg bg-exito px-4 py-2.5 text-sm font-semibold text-white shadow-suave transition hover:bg-exito-oscura"
      >
        Sugerir Dosis Inicial
      </button>

      {resultado && (
        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-center text-xs font-medium text-ink-suave">
          {resultado}
        </p>
      )}
    </div>
  );
}
