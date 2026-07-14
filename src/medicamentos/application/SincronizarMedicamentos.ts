import type { CatalogoExterno } from "../domain/CatalogoExterno";
import type { MedicamentoRepository } from "../domain/MedicamentoRepository";

const LIMITE_POR_DEFECTO = 25;
const LIMITE_MAXIMO = 100;

export interface ResultadoSincronizacion {
  readonly descargadas: number;
  readonly guardadas: number;
  readonly descartadas: number;
}

export class SincronizarMedicamentos {
  constructor(
    private readonly catalogo: CatalogoExterno,
    private readonly repositorio: MedicamentoRepository,
  ) {}

  async run(termino: string, limite: number = LIMITE_POR_DEFECTO): Promise<ResultadoSincronizacion> {
    const busqueda = termino.trim();
    if (busqueda.length === 0) {
      throw new Error("Hay que indicar qué medicamento sincronizar.");
    }

    const fichas = await this.catalogo.descargar(
      busqueda,
      Math.min(Math.max(limite, 1), LIMITE_MAXIMO),
    );

    // openFDA devuelve etiquetas sin marca ni genérico (envases, kits...).
    // No sirven para estudiar ni para generar preguntas, así que no entran
    // en la caché. La regla la pone el dominio, no el cliente HTTP.
    const utilizables = fichas.filter((ficha) => ficha.esUtilizable());
    const guardadas = await this.repositorio.guardar(utilizables);

    return {
      descargadas: fichas.length,
      guardadas,
      descartadas: fichas.length - utilizables.length,
    };
  }
}
