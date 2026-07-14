import "server-only";

import type { Pool, RowDataPacket } from "mysql2/promise";

import type { CampoFicha, TextosFicha } from "../domain/Ficha";
import type { TraduccionRepository } from "../domain/TraduccionRepository";
import type { Idioma } from "../domain/Traductor";

// El dominio nombra los campos en camelCase; la columna ENUM de MySQL, en
// snake_case. La traducción entre ambos vocabularios es cosa del adapter:
// el dominio no tiene por qué hablar como una base de datos.
const A_COLUMNA: Record<CampoFicha, string> = {
  indicaciones: "indicaciones",
  dosis: "dosis",
  contraindicaciones: "contraindicaciones",
  efectosAdversos: "efectos_adversos",
  advertencias: "advertencias",
};

const A_DOMINIO = Object.fromEntries(
  Object.entries(A_COLUMNA).map(([campo, columna]) => [columna, campo as CampoFicha]),
) as Record<string, CampoFicha>;

interface FilaTraduccion extends RowDataPacket {
  campo: string;
  texto: string;
}

export class MysqlTraduccionRepository implements TraduccionRepository {
  constructor(private readonly pool: Pool) {}

  async obtener(medicamentoId: number, idioma: Idioma): Promise<TextosFicha> {
    const [filas] = await this.pool.query<FilaTraduccion[]>(
      `SELECT campo, texto FROM medicamento_traduccion
        WHERE medicamento_id = ? AND idioma = ?`,
      [medicamentoId, idioma],
    );

    const textos: Partial<Record<CampoFicha, string>> = {};
    for (const fila of filas) {
      const campo = A_DOMINIO[fila.campo];
      if (campo) textos[campo] = fila.texto;
    }
    return textos;
  }

  async guardar(
    medicamentoId: number,
    idioma: Idioma,
    traducciones: ReadonlyArray<{ campo: CampoFicha; texto: string }>,
  ): Promise<void> {
    if (traducciones.length === 0) return;

    const valores = traducciones.map(({ campo, texto }) => [
      medicamentoId,
      idioma,
      A_COLUMNA[campo],
      texto,
    ]);

    // UPSERT sobre (medicamento_id, idioma, campo): si el texto original cambia
    // en una re-sincronización y hay que retraducir, se pisa la traducción vieja
    // en vez de duplicarla.
    await this.pool.query(
      `INSERT INTO medicamento_traduccion (medicamento_id, idioma, campo, texto)
       VALUES ?
       ON DUPLICATE KEY UPDATE texto = VALUES(texto), traducido_en = CURRENT_TIMESTAMP`,
      [valores],
    );
  }
}
