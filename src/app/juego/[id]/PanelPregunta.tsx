"use client";

import { useEffect, useState } from "react";

import { responderAction } from "./actions";

const LETRAS = ["A", "B", "C", "D", "E", "F"];

interface OpcionVista {
  id: number;
  texto: string;
}

interface Props {
  rondaId: number;
  preguntaId: number;
  etiquetaAtributo: string;
  enunciado: string;
  opciones: OpcionVista[];
  numero: number;
  total: number;
  aciertos: number;
  segundos?: number;
}

function mmss(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// El centro del mockup: cabecera con timer, barra de progreso, tarjeta de la
// pregunta con opciones A/B/C/D (se seleccionan y luego se confirman con
// "Siguiente Pregunta") y la navegación inferior.
export default function PanelPregunta({
  rondaId,
  preguntaId,
  etiquetaAtributo,
  enunciado,
  opciones,
  numero,
  total,
  aciertos,
  segundos = 45,
}: Props) {
  const [elegida, setElegida] = useState<number | null>(null);
  const [restante, setRestante] = useState(segundos);

  // Cuenta atrás por pregunta. El componente se remonta al cambiar de pregunta
  // (key={pregunta.id} en el padre), así que el estado ya arranca en `segundos`;
  // aquí solo montamos el intervalo que descuenta cada segundo.
  useEffect(() => {
    const t = setInterval(() => {
      setRestante((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [preguntaId]);

  const progreso = total > 0 ? ((numero - 1) / total) * 100 : 0;
  const urgente = restante <= 10;

  return (
    <div className="space-y-4">
      {/* Cabecera: número de pregunta + timer */}
      <div className="flex items-center justify-between rounded-tarjeta border border-borde bg-surface px-5 py-3.5 shadow-suave">
        <span className="flex items-center gap-2.5 font-semibold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-marca-brillante">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Pregunta <span className="tabular">{numero}</span> de{" "}
          <span className="tabular">{total}</span>
        </span>
        <span
          className={`tabular flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold ${
            urgente ? "bg-error-tenue text-error" : "bg-marca-tenue text-marca-brillante"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" />
          </svg>
          {mmss(restante)}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 overflow-hidden rounded-full bg-borde">
        <div
          className="h-full rounded-full bg-marca transition-[width] duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Tarjeta de la pregunta */}
      <form
        action={responderAction}
        className="space-y-5 rounded-tarjeta border-2 border-marca bg-surface p-6 shadow-elevada sm:p-8"
      >
        <input type="hidden" name="rondaId" value={rondaId} />
        <input type="hidden" name="preguntaId" value={preguntaId} />
        <input type="hidden" name="opcion" value={elegida ?? ""} />

        <div className="space-y-4">
          <span className="inline-block rounded-md bg-marca-tenue px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-marca-brillante">
            {etiquetaAtributo}
          </span>
          <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">
            {enunciado}
          </h2>
        </div>

        {/* Opciones A/B/C/D */}
        <div className="space-y-3">
          {opciones.map((opcion, i) => {
            const activa = elegida === opcion.id;
            return (
              <button
                key={opcion.id}
                type="button"
                onClick={() => setElegida(opcion.id)}
                className={`flex w-full items-center gap-4 rounded-tarjeta border-2 px-4 py-3.5 text-left transition ${
                  activa
                    ? "border-marca bg-marca-tenue shadow-suave"
                    : "border-borde bg-surface hover:border-marca-brillante hover:bg-marca-tenue/50"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                    activa ? "bg-marca text-white" : "bg-marca-tenue text-marca-brillante"
                  }`}
                >
                  {LETRAS[i]}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium">{opcion.texto}</span>
                {activa && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-marca">
                    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Navegación inferior */}
        <div className="flex items-center justify-between pt-2">
          <span className="tabular text-sm text-ink-tenue">{aciertos} aciertos</span>
          <button
            type="submit"
            disabled={elegida === null}
            className="inline-flex items-center gap-2 rounded-xl bg-marca px-6 py-3 text-sm font-semibold text-white shadow-suave transition hover:bg-marca-oscura disabled:opacity-40"
          >
            Siguiente Pregunta
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
