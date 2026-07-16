import type { RondaRepository } from "../domain/RondaRepository";
import type { Ronda } from "../domain/Ronda";

export class ObtenerRonda {
  constructor(private readonly repositorio: RondaRepository) {}

  async run(rondaId: number): Promise<Ronda | null> {
    return this.repositorio.obtener(rondaId);
  }
}
