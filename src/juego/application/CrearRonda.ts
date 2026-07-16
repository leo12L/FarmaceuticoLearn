import type { CatalogoJugable } from "../domain/CatalogoJugable";
import {
  generarPreguntas,
  MedicamentosInsuficientes,
  preguntasPosibles,
} from "../domain/GeneradorDePreguntas";
import type { RondaRepository } from "../domain/RondaRepository";

export class CrearRonda {
  constructor(
    private readonly catalogo: CatalogoJugable,
    private readonly repositorio: RondaRepository,
  ) {}

  async run(
    usuarioId: number,
    medicamentoIds: readonly number[],
    preguntasPedidas: number,
  ): Promise<number> {
    const medicamentos = await this.catalogo.obtener(medicamentoIds);

    // Puede que se pidan 20 preguntas pero los medicamentos elegidos solo den
    // para 12 (hay fichas con dos campos y otras con cinco). Se ajusta en vez
    // de fallar: el usuario prefiere jugar 12 a que le digan que no.
    const cantidad = Math.min(preguntasPedidas, preguntasPosibles(medicamentos));

    if (cantidad === 0) {
      throw new MedicamentosInsuficientes(medicamentos.length);
    }

    const preguntas = generarPreguntas(medicamentos, cantidad);

    return this.repositorio.crear(
      usuarioId,
      medicamentos.map((m) => m.id),
      preguntas,
    );
  }
}
