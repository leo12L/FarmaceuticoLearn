import Link from "next/link";

// Las tres secciones principales, para que la primera impresión de la página
// refleje la misma navegación de arriba.
const SECCIONES = [
  {
    href: "/medicamentos",
    titulo: "Enciclopedia",
    texto: "Busca por marca, genérico o principio activo y lee la ficha completa.",
    accion: "Explorar",
    icono: <IconoLibro />,
  },
  {
    href: "/juego/nueva",
    titulo: "Juego",
    texto: "Lee un fragmento del prospecto y acierta de qué fármaco es.",
    accion: "Jugar",
    icono: <IconoDiana />,
  },
  {
    href: "/ranking",
    titulo: "Ranking",
    texto: "Compara tu puntuación con la del resto y sube en la clasificación.",
    accion: "Ver ranking",
    icono: <IconoTrofeo />,
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="max-w-2xl space-y-4 pt-6">
        <h1 className="text-4xl font-bold tracking-tight text-balance text-marca sm:text-5xl">
          Estudia farmacología con fichas reales.
        </h1>
        <p className="text-lg text-ink-suave text-pretty">
          Consulta prospectos de medicamentos traducidos al español y ponte a
          prueba con rondas de repaso.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {SECCIONES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col rounded-tarjeta border border-borde bg-surface p-6 shadow-suave transition hover:border-marca hover:shadow-elevada"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-marca-tenue text-marca-brillante">
              {s.icono}
            </span>
            <h2 className="mt-4 font-semibold text-marca">{s.titulo}</h2>
            <p className="mt-1 flex-1 text-sm text-ink-suave">{s.texto}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-marca-brillante">
              {s.accion}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

// --- Iconos (SVG inline, sin dependencias) ---

function IconoLibro() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconoDiana() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconoTrofeo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
