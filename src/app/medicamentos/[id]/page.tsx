import Link from "next/link";
import { notFound } from "next/navigation";

import { obtenerFichaMedicamento } from "@/di/container";
import type { CampoFicha } from "@/medicamentos/domain/Ficha";

// Cómo se titula cada campo es decisión de presentación, no del dominio.
const TITULOS: Record<CampoFicha, string> = {
  indicaciones: "Indicaciones",
  dosis: "Posología",
  contraindicaciones: "Contraindicaciones",
  efectosAdversos: "Efectos adversos",
  advertencias: "Advertencias",
};

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

  return (
    <article className="space-y-8">
      <div className="space-y-2">
        <Link href="/medicamentos" className="text-sm opacity-60 hover:opacity-100">
          ← Catálogo
        </Link>
        <h1 className="text-3xl font-semibold">{medicamento.nombre()}</h1>
        {medicamento.subtitulo() && (
          <p className="opacity-60">{medicamento.subtitulo()}</p>
        )}
        {medicamento.principioActivo && (
          <p className="text-sm opacity-80">{medicamento.principioActivo}</p>
        )}
        {medicamento.fabricante && (
          <p className="text-xs opacity-50">{medicamento.fabricante}</p>
        )}
      </div>

      {ficha.camposPresentes().map((campo) => (
        <section key={campo} className="space-y-2">
          <h2 className="text-lg font-medium">{TITULOS[campo]}</h2>
          <div className="space-y-3 text-sm leading-relaxed opacity-90">
            {ficha.textos[campo]!.split("\n\n").map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>
        </section>
      ))}

      <p className="border-t border-black/10 pt-4 text-xs opacity-50 dark:border-white/15">
        Fuente: openFDA · Traducción automática · Contenido educativo, no es
        consejo médico.
      </p>
    </article>
  );
}
