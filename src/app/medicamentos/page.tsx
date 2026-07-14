import Link from "next/link";

import { buscarMedicamentos } from "@/di/container";

import { sincronizarDesdeOpenFda } from "./actions";

// En Next 16 `searchParams` es una Promise: hay que await-earla.
// Usarla opta a la página a renderizado dinámico, que es justo lo que
// queremos aquí (la búsqueda depende de la petición).
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  // Server Component: llamada directa al caso de uso. Sin fetch, sin /api,
  // sin saltos de red contra nosotros mismos.
  const medicamentos = await buscarMedicamentos.run(q);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Catálogo</h1>

      {/* Un <form> normal con GET: la búsqueda vive en la URL, así que es
          enlazable y compartible, y la página sigue siendo un Server Component. */}
      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por marca, genérico o principio activo…"
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Buscar
        </button>
      </form>

      {/* Trae fichas nuevas desde openFDA a la caché local. La action es un
          POST; el buscador de arriba es un GET. Son cosas distintas. */}
      <form action={sincronizarDesdeOpenFda} className="flex gap-2">
        <input
          type="text"
          name="termino"
          defaultValue={q ?? ""}
          placeholder="Traer desde openFDA (en inglés: ibuprofen, omeprazole…)"
          className="w-full rounded-lg border border-dashed border-black/20 px-3 py-2 text-sm dark:border-white/25"
        />
        <button
          type="submit"
          className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
        >
          Sincronizar
        </button>
      </form>

      {medicamentos.length === 0 ? (
        <p className="opacity-70">
          {q
            ? `Sin resultados para «${q}». Prueba a sincronizarlo desde openFDA.`
            : "El catálogo está vacío. Todavía no hemos sincronizado nada desde openFDA."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicamentos.map((medicamento) => (
            <li
              key={medicamento.id}
              className="rounded-xl border border-black/10 p-4 transition hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
            >
              <Link href={`/medicamentos/${medicamento.id}`} className="block">
                <h2 className="font-medium">{medicamento.nombre()}</h2>
                {medicamento.subtitulo() && (
                  <p className="text-sm opacity-60">{medicamento.subtitulo()}</p>
                )}
                {medicamento.principioActivo && (
                  <p className="mt-2 text-sm opacity-80">{medicamento.principioActivo}</p>
                )}
                {medicamento.fabricante && (
                  <p className="mt-2 text-xs opacity-50">{medicamento.fabricante}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
