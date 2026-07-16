import type { Medicamento } from "./Medicamento";

// Los campos de texto de una ficha. El orden es el que se lee de arriba abajo.
export const CAMPOS_FICHA = [
  "indicaciones",
  "dosis",
  "contraindicaciones",
  "efectosAdversos",
  "advertencias",
] as const;

export type CampoFicha = (typeof CAMPOS_FICHA)[number];

export type TextosFicha = Readonly<Partial<Record<CampoFicha, string>>>;

/**
 * Cuánto texto se conserva de cada campo.
 *
 * openFDA devuelve el prospecto legal completo: hay campos de más de 11.000
 * caracteres de letra pequeña. Para ESTUDIAR farmacología eso no aporta —lo
 * relevante está siempre al principio— y además dispara el coste de traducir.
 * Con este tope el catálogo entero pasa de 437.631 caracteres a unos 99.000.
 */
const LIMITE_CARACTERES = 800;

/**
 * Recorta por final de frase, nunca a mitad de palabra. Si no encuentra un
 * punto razonablemente cerca del tope, corta por el último espacio.
 */
function recortar(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;

  const trozo = texto.slice(0, limite);
  const finFrase = Math.max(trozo.lastIndexOf(". "), trozo.lastIndexOf(".\n"));

  // Solo vale si el punto no deja el texto ridículamente corto: si cae en el
  // primer 40% del tope, es mejor cortar por palabra y conservar más contenido.
  if (finFrase > limite * 0.4) {
    return `${trozo.slice(0, finFrase + 1)} […]`;
  }

  const finPalabra = trozo.lastIndexOf(" ");
  const base = finPalabra > 0 ? trozo.slice(0, finPalabra) : trozo;
  return `${base.trimEnd()} […]`;
}

export class Ficha {
  constructor(
    readonly medicamento: Medicamento,
    /** Los textos, en el idioma en que estén ahora mismo. */
    readonly textos: TextosFicha,
  ) {}

  /**
   * openFDA no rellena todos los campos: las etiquetas OTC no traen
   * contraindicaciones, y hay fichas sin posología. Solo estos campos existen
   * de verdad, y son los únicos que tiene sentido traducir o mostrar.
   */
  camposPresentes(): CampoFicha[] {
    return CAMPOS_FICHA.filter((campo) => {
      const texto = this.textos[campo];
      return typeof texto === "string" && texto.length > 0;
    });
  }

  /** Devuelve la misma ficha con otros textos (los traducidos). Inmutable. */
  con(textos: TextosFicha): Ficha {
    return new Ficha(this.medicamento, { ...this.textos, ...textos });
  }

  /**
   * La versión de estudio: cada campo recortado a lo esencial.
   *
   * Se recorta ANTES de traducir, no después. Traducir 13.000 caracteres para
   * luego enseñar 800 sería pagar por texto que nadie va a leer. El original
   * completo sigue guardado en la base: si algún día tenemos un traductor sin
   * cuota, basta con subir el tope y retraducir.
   */
  resumida(limite: number = LIMITE_CARACTERES): Ficha {
    const textos: Partial<Record<CampoFicha, string>> = {};
    for (const campo of this.camposPresentes()) {
      textos[campo] = recortar(this.textos[campo] as string, limite);
    }
    return new Ficha(this.medicamento, textos);
  }
}
