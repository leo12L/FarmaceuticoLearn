import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { obtenerFichaMedicamento } from "@/di/container";

export default async function FichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // En Next 16 `params` también es una Promise.
  const { id } = await params;

  const ficha = await obtenerFichaMedicamento.run(Number(id));
  if (ficha === null) notFound();

  const { medicamento } = ficha;

  // ── ¿Qué es? Se compone con los datos reales que tenemos (nombre, principio
  //    activo, fabricante). No hay un campo "descripción" en openFDA, así que no
  //    inventamos texto: enunciamos hechos. ──────────────────────────────────
  const queEs =
    `${medicamento.nombre()} es un medicamento` +
    (medicamento.principioActivo ? ` a base de ${medicamento.principioActivo}` : "") +
    (medicamento.fabricante ? `, distribuido por ${medicamento.fabricante}` : "") +
    ".";

  const indicaciones = ficha.textos.indicaciones;

  // Las tres categorías pedidas. Cada una sale de un dato real; si falta, se
  // dice claramente en vez de dejar un hueco.
  const categorias: {
    pregunta: string;
    icono: ReactNode;
    parrafos: string[] | null;
  }[] = [
    {
      pregunta: "¿Qué es?",
      icono: <IconoInfo />,
      parrafos: [queEs],
    },
    {
      pregunta: "¿Qué compuestos químicos tiene?",
      icono: <IconoMolecula />,
      parrafos: medicamento.principioActivo
        ? [medicamento.principioActivo]
        : null,
    },
    {
      pregunta: "¿Cuándo usarlo?",
      icono: <IconoReloj />,
      parrafos: indicaciones ? indicaciones.split("\n\n") : null,
    },
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/medicamentos"
        className="inline-flex items-center gap-1 text-sm font-medium text-marca-brillante transition hover:underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Enciclopedia
      </Link>

      {/* Cabecera */}
      <header className="overflow-hidden rounded-tarjeta border border-borde bg-surface shadow-suave">
        <div className="flex items-center gap-4 bg-gradient-to-br from-marca to-marca-brillante p-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
            </svg>
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white">{medicamento.nombre()}</h1>
            {medicamento.subtitulo() && (
              <p className="text-sm text-white/80">{medicamento.subtitulo()}</p>
            )}
          </div>
        </div>

        {(medicamento.principioActivo || medicamento.fabricante) && (
          <dl className="flex flex-wrap gap-x-10 gap-y-3 p-5 text-sm">
            {medicamento.principioActivo && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-tenue">
                  Principio activo
                </dt>
                <dd className="mt-0.5 font-medium">{medicamento.principioActivo}</dd>
              </div>
            )}
            {medicamento.fabricante && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-tenue">
                  Laboratorio
                </dt>
                <dd className="mt-0.5 font-medium">{medicamento.fabricante}</dd>
              </div>
            )}
          </dl>
        )}
      </header>

      {/* Categorías */}
      <div className="space-y-4">
        {categorias.map((cat) => (
          <section
            key={cat.pregunta}
            className="rounded-tarjeta border border-borde bg-surface p-6 shadow-suave"
          >
            <h2 className="flex items-center gap-3 text-lg font-bold text-marca">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-marca-tenue text-marca-brillante">
                {cat.icono}
              </span>
              {cat.pregunta}
            </h2>

            <div className="mt-3 max-w-prose space-y-3 pl-12 text-[0.9375rem] leading-relaxed text-ink-suave">
              {cat.parrafos ? (
                cat.parrafos.map((parrafo, i) => <p key={i}>{parrafo}</p>)
              ) : (
                <p className="italic text-ink-tenue">
                  Esta información no está disponible para este fármaco.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-ink-tenue">
        Datos de openFDA · Traducción automática · Contenido educativo, no es consejo médico.
      </p>
    </article>
  );
}

// --- Iconos (SVG inline, sin dependencias) ---

function IconoInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function IconoMolecula() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="2.5" /><circle cx="19" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" />
      <path d="M7 7 10.5 16M13.5 16 17 7M6.5 6h11" />
    </svg>
  );
}

function IconoReloj() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}
