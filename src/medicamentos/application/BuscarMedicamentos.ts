import type { Medicamento } from "../domain/Medicamento";
import type { MedicamentoRepository } from "../domain/MedicamentoRepository";

const LIMITE_POR_DEFECTO = 24;
const LIMITE_MAXIMO = 100;

export class BuscarMedicamentos {
  constructor(private readonly repositorio: MedicamentoRepository) {}

  async run(texto?: string, limite: number = LIMITE_POR_DEFECTO): Promise<Medicamento[]> {
    const busqueda = texto?.trim();

    return this.repositorio.buscar({
      texto: busqueda && busqueda.length > 0 ? busqueda : undefined,
      // El tope no se negocia desde fuera: aunque la URL pida 10.000,
      // aquí se corta. Es una regla de la aplicación, no de la UI.
      limite: Math.min(Math.max(limite, 1), LIMITE_MAXIMO),
    });
  }
}
