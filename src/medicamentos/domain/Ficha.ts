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
}
