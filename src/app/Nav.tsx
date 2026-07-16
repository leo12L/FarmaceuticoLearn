"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Los items de la barra. Mapean el mockup de FarmaEdu a las rutas reales.
const ENLACES = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/medicamentos", etiqueta: "Enciclopedia" },
  { href: "/juego/nueva", etiqueta: "Juego" },
  { href: "/ranking", etiqueta: "Ranking" },
] as const;

// Un enlace está activo si la ruta actual es su sección (así /juego/[id] también
// marca "Juego", y /medicamentos/[id] marca "Enciclopedia"). "Inicio" es un caso
// aparte: solo se marca en la raíz exacta, o coincidiría con todas las rutas.
function estaActivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const seccion = "/" + href.split("/")[1];
  return pathname === href || pathname.startsWith(seccion);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-3.5">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-marca text-white"
          >
            <IconoMaletin />
          </span>
          <span className="text-lg font-bold tracking-tight text-marca">FarmaEdu</span>
        </Link>

        {/* Navegación principal */}
        <div className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium md:flex">
          {ENLACES.map((e) => {
            const activo = estaActivo(pathname, e.href);
            return (
              <Link
                key={e.href}
                href={e.href}
                className={
                  activo
                    ? "border-b-2 border-marca-brillante pb-0.5 text-marca-brillante"
                    : "text-ink-suave transition-colors hover:text-ink"
                }
              >
                {e.etiqueta}
              </Link>
            );
          })}
        </div>

        {/* Acciones a la derecha. El avatar lleva al perfil; no ponemos campana
            ni ajustes porque todavía no hay notificaciones ni pantalla de
            configuración: un botón que no hace nada es peor que no tenerlo. */}
        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link
            href="/usuarios"
            aria-label="Perfil"
            title="Perfil"
            className="grid h-9 w-9 place-items-center rounded-full bg-marca text-xs font-semibold text-white transition hover:bg-marca-oscura"
          >
            JD
          </Link>
        </div>
      </nav>

      {/* Navegación en móvil */}
      <div className="flex items-center gap-5 overflow-x-auto border-t border-borde px-6 py-2 text-sm font-medium md:hidden">
        {ENLACES.map((e) => {
          const activo = estaActivo(pathname, e.href);
          return (
            <Link
              key={e.href}
              href={e.href}
              className={activo ? "text-marca-brillante" : "text-ink-suave"}
            >
              {e.etiqueta}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

// --- Iconos (SVG inline, sin dependencias) ---

function IconoMaletin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 11v4M10 13h4" />
    </svg>
  );
}

