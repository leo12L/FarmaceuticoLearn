// Una fila del ranking. Es una proyección de lectura (viene de la vista SQL
// `v_ranking`), no una entidad con comportamiento: por eso es un tipo plano.
export interface EntradaRanking {
  readonly usuarioId: number;
  readonly nombre: string;
  readonly puntosTotales: number;
  readonly rondasJugadas: number;
}

// EL PUERTO. El dominio pide "dame el ranking"; que salga de una vista de MySQL
// es un detalle de infraestructura.
export interface RankingRepository {
  top(limite: number): Promise<EntradaRanking[]>;
}
