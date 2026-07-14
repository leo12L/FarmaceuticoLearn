import type { FichaMedicamento } from "./FichaMedicamento";

// PUERTO de la fuente de datos externa. El dominio dice "necesito poder traerme
// fichas de medicamentos de fuera"; que sea openFDA —y no CIMA, ni un CSV— es
// un detalle que vive en infraestructura.

export interface CatalogoExterno {
  /** Descarga fichas cuyo nombre o principio activo coincida con el término. */
  descargar(termino: string, limite: number): Promise<FichaMedicamento[]>;
}
