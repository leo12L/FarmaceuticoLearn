import Link from "next/link";

import { buscarMedicamentos } from "@/di/container";
import { MINIMO_MEDICAMENTOS } from "@/juego/domain/GeneradorDePreguntas";
import { CATEGORIAS_FARMACO } from "@/medicamentos/domain/Medicamento";

import { crearRondaAction } from "./actions";

// Las mismas secciones de la Enciclopedia: el usuario elige qué estudiar.
const FILTROS = ["Todas", ...CATEGORIAS_FARMACO] as const;

export default async function NuevaRondaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cat?: string }>;
}) {
  const { error, cat } = await searchParams;

  // Filtramos por categoría igual que la Enciclopedia (medicamento.categoria()).
  const todos = await buscarMedicamentos.run(undefined, 100);
  const activo = FILTROS.includes(cat as (typeof FILTROS)[number]) ? cat : "Todas";
  const medicamentos =
    activo && activo !== "Todas"
      ? todos.filter((m) => m.categoria() === activo)
      : todos;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva ronda</h1>
        <p className="text-sm text-ink-suave">
          Elige una categoría y los fármacos a repasar. Verás fragmentos de sus
          prospectos y tendrás que acertar de cuál son. Mínimo {MINIMO_MEDICAMENTOS}{" "}
          fármacos distintos.
        </p>
      </header>

      {/* Secciones (categorías) para elegir qué estudiar */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((categoria) => (
          <Link
            key={categoria}
            href={categoria === "Todas" ? "/juego/nueva" : `/juego/nueva?cat=${encodeURIComponent(categoria)}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activo === categoria
                ? "bg-marca text-white"
                : "border border-borde bg-surface text-ink-suave hover:border-marca hover:text-marca"
            }`}
          >
            {categoria}
          </Link>
        ))}
      </div>

      {error && (
        <p className="rounded-tarjeta border border-error/30 bg-error/5 p-4 text-sm text-error">
          {error}
        </p>
      )}

      {medicamentos.length < MINIMO_MEDICAMENTOS ? (
        <div className="rounded-tarjeta border border-dashed border-borde-fuerte p-10 text-center text-sm text-ink-suave">
          {activo !== "Todas"
            ? `«${activo}» no tiene suficientes fármacos para una ronda (mínimo ${MINIMO_MEDICAMENTOS}). Prueba otra categoría o «Todas».`
            : "No hay suficientes medicamentos. Sincroniza algunos desde openFDA en el catálogo."}
        </div>
      ) : (
        <form action={crearRondaAction} className="space-y-6">
          {/* La categoría activa viaja con el formulario por si hace falta. */}
          <input type="hidden" name="categoria" value={activo} />

          <fieldset className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {medicamentos.map((medicamento) => (
              <label key={medicamento.id} className="block cursor-pointer">
                {/* La casilla se esconde y el estilo lo lleva el <span> hermano
                    vía peer-checked: selección con estado visible y cero JS. */}
                <input
                  type="checkbox"
                  name="medicamento"
                  value={medicamento.id}
                  className="peer sr-only"
                />
                <span className="flex h-full flex-col rounded-tarjeta border border-borde bg-surface p-3.5 shadow-suave transition peer-checked:border-marca peer-checked:bg-marca-tenue peer-checked:ring-1 peer-checked:ring-marca peer-focus-visible:ring-2 peer-focus-visible:ring-marca/40 hover:border-borde-fuerte">
                  <span className="text-sm font-medium leading-snug">
                    {medicamento.nombre()}
                  </span>
                  {medicamento.principioActivo && (
                    <span className="mt-1 line-clamp-1 text-xs text-ink-tenue">
                      {medicamento.principioActivo}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>

          <div className="sticky bottom-4 flex items-end justify-between gap-4 rounded-tarjeta border border-borde bg-surface/90 p-4 shadow-elevada backdrop-blur">
            <label className="text-sm">
              <span className="mb-1 block text-ink-suave">Preguntas</span>
              <input
                type="number"
                name="preguntas"
                defaultValue={10}
                min={1}
                max={50}
                className="tabular w-24 rounded-lg border border-borde bg-canvas px-3 py-2 outline-none transition focus:border-marca"
              />
            </label>

            <button
              type="submit"
              className="rounded-lg bg-marca px-6 py-2.5 text-sm font-medium text-white shadow-suave transition hover:bg-marca-oscura"
            >
              Empezar ronda
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
