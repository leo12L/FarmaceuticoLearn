import type { MedicamentoJugable } from "./MedicamentoJugable";

// PUERTO. El juego necesita medicamentos con texto para preguntar, y le da
// igual de dónde salgan. Su adapter se encargará de preferir el texto ya
// traducido al español y caer al inglés si esa ficha aún no se ha traducido.

export interface CatalogoJugable {
  obtener(ids: readonly number[]): Promise<MedicamentoJugable[]>;
}
