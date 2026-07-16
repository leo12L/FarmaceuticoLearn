import "server-only";

import type { Pool, RowDataPacket } from "mysql2/promise";

import type { CatalogoJugable } from "../domain/CatalogoJugable";
import { clasificar, MedicamentoJugable } from "../domain/MedicamentoJugable";

interface FilaJugable extends RowDataPacket {
  id: number;
  nombre_marca: string | null;
  nombre_generico: string | null;
  principio_activo: string | null;
}

export class MysqlCatalogoJugable implements CatalogoJugable {
  constructor(private readonly pool: Pool) {}

  async obtener(ids: readonly number[]): Promise<MedicamentoJugable[]> {
    if (ids.length === 0) return [];

    // Solo datos estructurados: nombres y principio activo. Ya no se leen los
    // textos del prospecto (que openFDA da en inglés): las preguntas se montan
    // sobre el grupo terapéutico y el principio, no sobre párrafos legales.
    const [filas] = await this.pool.query<FilaJugable[]>(
      `SELECT m.id, m.nombre_marca, m.nombre_generico, m.principio_activo
         FROM medicamento m
        WHERE m.id IN (?)`,
      [ids],
    );

    return filas
      .map((fila) => {
        const principio = fila.principio_activo ?? fila.nombre_generico;
        // Sin principio activo no hay ni respuesta ni grupo: es injugable.
        if (!principio) return null;

        // Para nombrar el fármaco en la pregunta preferimos la marca; si no la
        // hay, el genérico sirve igual.
        const nombreMarca = fila.nombre_marca ?? fila.nombre_generico ?? principio;

        // El grupo terapéutico se deduce de cualquier nombre disponible.
        const categoria = clasificar(
          `${principio} ${fila.nombre_generico ?? ""} ${fila.nombre_marca ?? ""}`,
        );

        return new MedicamentoJugable(fila.id, nombreMarca, principio, categoria);
      })
      .filter((m): m is MedicamentoJugable => m !== null);
  }
}
