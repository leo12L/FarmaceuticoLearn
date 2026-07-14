import type { Ficha } from "./Ficha";
import type { FichaMedicamento } from "./FichaMedicamento";
import type { Medicamento } from "./Medicamento";

// EL PUERTO. El dominio declara lo que necesita ("poder buscar y guardar
// medicamentos"), no cómo se consigue. Quién lo implemente —MySQL hoy, un mock
// en los tests— es un detalle de infraestructura.

export interface CriteriosBusqueda {
  /** Texto libre: marca, nombre genérico o principio activo. */
  readonly texto?: string;
  readonly limite: number;
}

export interface MedicamentoRepository {
  buscar(criterios: CriteriosBusqueda): Promise<Medicamento[]>;

  /** La ficha completa, con sus textos en el idioma original (inglés). */
  obtenerFicha(id: number): Promise<Ficha | null>;

  /**
   * Guarda las fichas en la caché local. Es un upsert por `openFdaSetId`:
   * volver a sincronizar el mismo medicamento lo actualiza, no lo duplica.
   * Devuelve cuántas fichas se guardaron.
   */
  guardar(fichas: readonly FichaMedicamento[]): Promise<number>;
}
