// La ficha completa tal como la entiende NUESTRO dominio.
// Todavía no tiene `id`: eso lo pone nuestra base al persistirla. Su identidad
// aquí es el set_id de openFDA, que es estable entre versiones de la etiqueta.

export class FichaMedicamento {
  constructor(
    readonly openFdaSetId: string,
    readonly nombreMarca: string | null,
    readonly nombreGenerico: string | null,
    readonly principioActivo: string | null,
    readonly fabricante: string | null,
    readonly indicaciones: string | null,
    readonly contraindicaciones: string | null,
    readonly dosis: string | null,
    readonly efectosAdversos: string | null,
    readonly advertencias: string | null,
  ) {}

  // Una etiqueta sin ningún nombre no sirve para estudiar ni para jugar:
  // no habría forma de preguntar por ella.
  esUtilizable(): boolean {
    return this.nombreMarca !== null || this.nombreGenerico !== null;
  }
}
