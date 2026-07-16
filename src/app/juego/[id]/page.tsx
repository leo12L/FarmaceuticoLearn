import Link from "next/link";
import { notFound } from "next/navigation";

import { obtenerRanking, obtenerRonda } from "@/di/container";
import type { TipoPregunta } from "@/juego/domain/MedicamentoJugable";

import CalculadoraDosis from "./CalculadoraDosis";
import PanelPregunta from "./PanelPregunta";

// Qué mide la pregunta: la etiqueta que corona la tarjeta.
const ETIQUETA: Record<TipoPregunta, string> = {
  grupoTerapeutico: "Grupo terapéutico",
  principioActivo: "Principio activo",
};

// Perla clínica según de qué trata la pregunta. Es contenido educativo fijo por
// tipo (aún no hay tabla de perlas; ese es un paso posterior).
const PERLA: Record<TipoPregunta, string> = {
  grupoTerapeutico:
    "Clasificar por grupo terapéutico ayuda a predecir efectos e interacciones: los fármacos de una misma familia suelen compartir mecanismo y precauciones.",
  principioActivo:
    "El principio activo es lo que de verdad actúa; una misma molécula se vende bajo muchas marcas. Estudia por principio activo, no por nombre comercial.",
};

const MEDALLAS = [
  { nombre: "Racha", icono: "🏅", activa: true },
  { nombre: "Veloz", icono: "⏱️", activa: true },
  { nombre: "Maestro", icono: "🧠", activa: false },
];

export default async function JugarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ronda = await obtenerRonda.run(Number(id));
  if (ronda === null) notFound();

  const pregunta = ronda.preguntaActual();
  const total = ronda.preguntas.length;
  const aciertos = ronda.aciertos();
  const respondidas = ronda.preguntas.filter((p) => p.respondida()).length;

  // ── Ronda terminada: el resultado ───────────────────────────────────────
  if (pregunta === null) {
    const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <section className="rounded-tarjeta border border-borde bg-surface p-8 text-center shadow-suave">
          <p className="text-sm text-ink-suave">Ronda terminada</p>
          <p className="tabular mt-2 text-5xl font-semibold tracking-tight text-marca">
            {aciertos}
            <span className="text-ink-tenue">/{total}</span>
          </p>
          <p className="mt-2 text-sm text-ink-suave">
            {porcentaje}% de aciertos · {ronda.puntos()} puntos
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-ink-suave">Repaso</h2>
          <ul className="space-y-2">
            {ronda.preguntas.map((p) => {
              const elegida = p.opciones.find((o) => o.id === p.opcionElegidaId);
              const correcta = p.opciones.find((o) => o.esCorrecta);
              const bien = p.acertada();

              return (
                <li
                  key={p.id}
                  className={`flex items-start gap-3 rounded-tarjeta border bg-surface p-3.5 text-sm shadow-suave ${
                    bien ? "border-exito/40" : "border-error/40"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                      bien ? "bg-exito" : "bg-error"
                    }`}
                  >
                    {bien ? "✓" : "✗"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wide text-ink-tenue">
                      {ETIQUETA[p.tipo]}
                    </span>
                    <span className="block">
                      Respondiste <strong>{elegida?.texto}</strong>
                      {!bien && (
                        <>
                          {" "}
                          · era <strong className="text-exito">{correcta?.texto}</strong>
                        </>
                      )}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <Link
          href="/juego/nueva"
          className="inline-block rounded-xl bg-marca px-6 py-2.5 text-sm font-semibold text-white shadow-suave transition hover:bg-marca-oscura"
        >
          Otra ronda
        </Link>
      </div>
    );
  }

  // ── Pregunta en curso: dashboard de tres columnas ───────────────────────
  const ranking = await obtenerRanking.run(3);
  const progresoRonda = total > 0 ? (respondidas / total) * 100 : 0;
  const opciones = pregunta.opciones
    .filter((o): o is typeof o & { id: number } => o.id !== null)
    .map((o) => ({ id: o.id, texto: o.texto }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
      {/* ── Columna izquierda ── */}
      <aside className="order-2 space-y-5 lg:order-1">
        {/* Progreso de la ronda (estilo tarjeta de nivel) */}
        <section className="rounded-tarjeta border border-borde bg-surface p-5 shadow-suave">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-tenue">
            Progreso de ronda
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="tabular text-4xl font-bold leading-none text-marca">
              {aciertos}
              <span className="text-2xl text-ink-tenue">/{total}</span>
            </span>
            <span className="rounded-md bg-exito-tenue px-2 py-1 text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-exito">
              {ETIQUETA[pregunta.tipo]}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-borde">
            <div
              className="h-full rounded-full bg-exito transition-[width] duration-500"
              style={{ width: `${progresoRonda}%` }}
            />
          </div>
          <p className="tabular mt-2 text-xs text-ink-suave">
            {ronda.puntos()} puntos · {respondidas} de {total} respondidas
          </p>
        </section>

        {/* Medallas */}
        <section className="rounded-tarjeta border border-borde bg-surface p-5 shadow-suave">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-tenue">
            Medallas recientes
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {MEDALLAS.map((m) => (
              <div key={m.nombre} className={m.activa ? "" : "opacity-40"}>
                <div
                  className={`mx-auto grid h-12 w-12 place-items-center rounded-xl text-xl ${
                    m.activa ? "bg-marca-tenue" : "bg-borde"
                  }`}
                >
                  {m.icono}
                </div>
                <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-suave">
                  {m.nombre}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Siguiente desafío */}
        <section className="relative overflow-hidden rounded-tarjeta border border-borde shadow-suave">
          <div className="absolute inset-0 bg-gradient-to-br from-marca to-marca-brillante" />
          <div className="relative flex h-32 flex-col justify-end p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              Siguiente desafío
            </p>
            <p className="text-sm font-semibold text-white">Farmacocinética avanzada</p>
          </div>
        </section>
      </aside>

      {/* ── Columna central ── */}
      <div className="order-1 lg:order-2">
        <PanelPregunta
          key={pregunta.id}
          rondaId={ronda.id ?? 0}
          preguntaId={pregunta.id ?? 0}
          etiquetaAtributo={`Desafío clínico · ${ETIQUETA[pregunta.tipo]}`}
          enunciado={pregunta.enunciado}
          opciones={opciones}
          numero={respondidas + 1}
          total={total}
          aciertos={aciertos}
        />

        <div className="mt-4 flex items-center justify-between px-1 text-sm">
          <span className="text-ink-tenue">Anterior</span>
          <Link href="/juego/nueva" className="font-medium text-marca-brillante hover:underline">
            Abandonar ronda
          </Link>
        </div>
      </div>

      {/* ── Columna derecha ── */}
      <aside className="order-3 space-y-5">
        {/* Perla clínica */}
        <section className="rounded-tarjeta border border-borde bg-marca-tenue/60 p-5 shadow-suave">
          <p className="flex items-center gap-2 font-semibold text-marca">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            Perla clínica
          </p>
          <p className="mt-2 text-sm italic leading-relaxed text-ink-suave">
            {PERLA[pregunta.tipo]}
          </p>
        </section>

        {/* Leaderboard (real, vía v_ranking) */}
        <section className="rounded-tarjeta border border-borde bg-surface p-5 shadow-suave">
          <p className="font-semibold">Leaderboard semanal</p>
          {ranking.length === 0 ? (
            <p className="mt-3 text-sm text-ink-suave">Aún no hay partidas registradas.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {ranking.map((e, i) => (
                <li key={e.usuarioId} className="flex items-center gap-3">
                  <span className="tabular w-4 text-sm font-bold text-marca">{i + 1}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-marca-tenue text-xs font-semibold text-marca">
                    {e.nombre.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{e.nombre}</span>
                  <span className="tabular text-sm font-semibold text-ink-suave">
                    {e.puntosTotales.toLocaleString("es")} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Link
            href="/juego/nueva"
            className="mt-4 block text-center text-sm font-semibold text-marca-brillante hover:underline"
          >
            Ver ranking completo
          </Link>
        </section>

        {/* Calculadora de dosis (funcional) */}
        <CalculadoraDosis />
      </aside>
    </div>
  );
}
