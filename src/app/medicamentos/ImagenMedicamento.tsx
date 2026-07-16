"use client";

import { useState } from "react";

// Ruta a la estructura molecular ya descargada en public/estructuras/. Se sirve
// local (rápido, sin depender del rate limit de PubChem en cada carga). El slug
// debe coincidir con el de scripts/descargar-estructuras.mjs. Si el archivo no
// existe (combo raro sin estructura), el <img> dispara onError y caemos al icono.
function rutaEstructura(nombre: string): string | null {
  const base = nombre.toLowerCase().split(/ and |,/)[0].trim();
  const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug ? `/estructuras/${slug}.png` : null;
}

export function ImagenMedicamento({
  nombreBusqueda,
  alt,
  acento,
  className = "h-32",
}: {
  /** El nombre con el que buscar en PubChem (mejor el genérico o el principio activo). */
  nombreBusqueda: string | null;
  alt: string;
  /** Degradado del fallback cuando no hay estructura disponible. */
  acento: string;
  className?: string;
}) {
  const [falla, setFalla] = useState(false);
  const url = nombreBusqueda ? rutaEstructura(nombreBusqueda) : null;

  // Fallback: el icono de pastilla sobre degradado, como antes.
  if (!url || falla) {
    return (
      <div className={`grid ${className} place-items-center bg-gradient-to-br ${acento}`}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden bg-white`}>
      {/* Absoluta + object-contain: la estructura se escala para caber en la
          caja sin desbordar sobre el texto, sea cual sea su proporción.
          Imagen local de tamaño variable con fallback en cliente; next/image
          no aporta aquí. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Estructura de ${alt}`}
        loading="lazy"
        onError={() => setFalla(true)}
        className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply"
      />
    </div>
  );
}
