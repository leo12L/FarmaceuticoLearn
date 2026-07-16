import "server-only";

import type { Pool, RowDataPacket } from "mysql2/promise";

import type { EntradaRanking, RankingRepository } from "../domain/Ranking";

interface FilaRanking extends RowDataPacket {
  usuario_id: number;
  nombre: string;
  puntos_totales: number;
  rondas_jugadas: number;
}

export class MysqlRanking implements RankingRepository {
  constructor(private readonly pool: Pool) {}

  async top(limite: number): Promise<EntradaRanking[]> {
    // `v_ranking` ya viene ordenada por puntos desc (ver schema.sql).
    const [filas] = await this.pool.query<FilaRanking[]>(
      `SELECT usuario_id, nombre, puntos_totales, rondas_jugadas
         FROM v_ranking
        LIMIT ?`,
      [limite],
    );

    return filas.map((f) => ({
      usuarioId: f.usuario_id,
      nombre: f.nombre,
      puntosTotales: Number(f.puntos_totales),
      rondasJugadas: Number(f.rondas_jugadas),
    }));
  }
}
