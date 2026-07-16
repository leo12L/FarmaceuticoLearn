import Link from "next/link";

import { buscarMedicamentos } from "@/di/container";
import { CATEGORIAS_FARMACO } from "@/medicamentos/domain/Medicamento";

import { ImagenMedicamento } from "./ImagenMedicamento";
import { sincronizarDesdeOpenFda } from "./actions";

// El filtro real: "Todas" + las categorías que el dominio sabe clasificar.
const FILTROS = ["Todas", ...CATEGORIAS_FARMACO] as const;

// Acento de la tarjeta rotando por índice, para que el grid no sea un muro
// monótono (no hay imágenes reales de cada fármaco).
const ACENTOS = ["from-marca to-marca-brillante", "from-marca-brillante to-exito", "from-exito to-marca", "from-marca-oscura to-marca-brillante"];

export default async function EnciclopediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;

  // Pedimos hasta el tope y filtramos por categoría aquí: la clasificación es
  // lógica de dominio (`medicamento.categoria()`), no una columna de la base.
  const todos = await buscarMedicamentos.run(q, 100);
  const activo = FILTROS.includes(cat as (typeof FILTROS)[number]) ? cat : "Todas";
  const medicamentos =
    activo && activo !== "Todas"
      ? todos.filter((m) => m.categoria() === activo)
      : todos;

  // Conserva la búsqueda al cambiar de categoría (y viceversa).
  const hrefFiltro = (categoria: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoria !== "Todas") params.set("cat", categoria);
    const qs = params.toString();
    return qs ? `/medicamentos?${qs}` : "/medicamentos";
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-marca sm:text-4xl">
          Enciclopedia de Fármacos
        </h1>
        <p className="max-w-2xl text-sm text-ink-suave">
          Base de datos de referencia académica para el estudio farmacológico.
          Información precisa sobre indicaciones, mecanismos y posología para el
          profesional farmacéutico.
        </p>
      </header>

      {/* Buscador (GET: la búsqueda vive en la URL, enlazable y compartible). */}
      <form className="relative max-w-xl">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tenue"
        >
          ⌕
        </span>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar fármaco…"
          className="w-full rounded-full border border-borde bg-surface py-2.5 pl-9 pr-4 text-sm shadow-suave outline-none transition placeholder:text-ink-tenue focus:border-marca focus:ring-2 focus:ring-marca/15"
        />
      </form>

      {/* Filtros por categoría (navegación real por query param) */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((categoria) => (
          <Link
            key={categoria}
            href={hrefFiltro(categoria)}
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

      {medicamentos.length === 0 ? (
        <div className="rounded-tarjeta border border-dashed border-borde-fuerte p-10 text-center">
          <p className="text-sm text-ink-suave">
            {activo !== "Todas"
              ? `No hay fármacos de «${activo}»${q ? ` para «${q}»` : ""} en el catálogo local.`
              : q
                ? `No hay nada para «${q}» en el catálogo local.`
                : "El catálogo está vacío."}
          </p>
          <p className="mt-1 text-sm text-ink-tenue">Puedes traer más desde openFDA aquí abajo.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {medicamentos.map((medicamento, i) => (
            <li key={medicamento.id}>
              <Link
                href={`/medicamentos/${medicamento.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde bg-surface shadow-suave transition hover:border-marca hover:shadow-elevada"
              >
                {/* Estructura molecular real (PubChem), con fallback al icono. */}
                <ImagenMedicamento
                  nombreBusqueda={medicamento.nombreGenerico ?? medicamento.principioActivo}
                  alt={medicamento.nombre()}
                  acento={ACENTOS[i % ACENTOS.length]}
                />
                <div className="border-t border-borde" />

                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-bold leading-snug text-marca">{medicamento.nombre()}</h2>
                  {medicamento.subtitulo() ? (
                    <p className="mt-0.5 text-xs font-medium italic text-marca-brillante">
                      {medicamento.subtitulo()}
                    </p>
                  ) : null}

                  {medicamento.principioActivo && (
                    <div className="mt-3">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-tenue">
                        Principio activo
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-ink-suave">
                        {medicamento.principioActivo}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="truncate text-xs text-ink-tenue">
                      {medicamento.fabricante ?? "—"}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-marca-brillante">
                      Ver detalles
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Sincronizar es mantenimiento; se guarda plegado. */}
      <details className="rounded-tarjeta border border-borde bg-surface p-4 shadow-suave">
        <summary className="cursor-pointer text-sm font-medium">
          Traer medicamentos desde openFDA
        </summary>
        <form action={sincronizarDesdeOpenFda} className="mt-4 flex gap-2">
          <input
            type="text"
            name="termino"
            defaultValue={q ?? ""}
            placeholder="En inglés: ibuprofen, metformin…"
            className="w-full rounded-lg border border-borde bg-canvas px-3 py-2 text-sm outline-none transition placeholder:text-ink-tenue focus:border-marca"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white transition hover:bg-marca-oscura"
          >
            Sincronizar
          </button>
        </form>
      </details>
    </div>
  );
}
