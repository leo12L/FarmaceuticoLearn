import type { EntradaRanking, RankingRepository } from "../domain/Ranking";

export class ObtenerRanking {
  constructor(private readonly repositorio: RankingRepository) {}

  async run(limite = 3): Promise<EntradaRanking[]> {
    return this.repositorio.top(limite);
  }
}
