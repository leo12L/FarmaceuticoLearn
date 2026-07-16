import "server-only";

import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import type { TipoPregunta } from "../domain/MedicamentoJugable";
import type { RondaRepository } from "../domain/RondaRepository";
import { Opcion, Pregunta, Ronda, type EstadoRonda } from "../domain/Ronda";

// El dominio nombra el tipo en camelCase; la columna ENUM `atributo`, en
// snake_case. (La columna conserva el nombre histórico `atributo`.)
const A_COLUMNA: Record<TipoPregunta, string> = {
  grupoTerapeutico: "grupo_terapeutico",
  principioActivo: "principio_activo",
};
// Rondas antiguas guardaron el fragmento del prospecto bajo otros valores del
// ENUM (indicaciones, dosis…). Ya no se generan, pero pueden quedar en la base;
// se mapean a `grupoTerapeutico` para que abrir una ronda vieja no reviente.
const A_DOMINIO: Record<string, TipoPregunta> = {
  grupo_terapeutico: "grupoTerapeutico",
  principio_activo: "principioActivo",
  indicaciones: "grupoTerapeutico",
  contraindicaciones: "grupoTerapeutico",
  dosis: "grupoTerapeutico",
  efectos_adversos: "grupoTerapeutico",
  advertencias: "grupoTerapeutico",
};

interface FilaRonda extends RowDataPacket {
  id: number;
  usuario_id: number;
  estado: EstadoRonda;
}

interface FilaPregunta extends RowDataPacket {
  id: number;
  medicamento_id: number;
  atributo: string;
  enunciado: string;
  orden: number;
  opcion_elegida_id: number | null;
}

interface FilaOpcion extends RowDataPacket {
  id: number;
  pregunta_id: number;
  texto: string;
  es_correcta: number;
  orden: number;
}

export class MysqlRondaRepository implements RondaRepository {
  constructor(private readonly pool: Pool) {}

  async crear(
    usuarioId: number,
    medicamentoIds: readonly number[],
    preguntas: readonly Pregunta[],
  ): Promise<number> {
    // TRANSACCIÓN: una ronda son cuatro tablas. Si petara a mitad, quedaría una
    // ronda sin preguntas, o preguntas sin opciones: basura injugable en la base.
    const conexion = await this.pool.getConnection();
    try {
      await conexion.beginTransaction();

      const [ronda] = await conexion.query<ResultSetHeader>(
        `INSERT INTO ronda (usuario_id, total_preguntas) VALUES (?, ?)`,
        [usuarioId, preguntas.length],
      );
      const rondaId = ronda.insertId;

      // La selección del usuario. Tiene que ir ANTES que las preguntas: la FK
      // compuesta de `pregunta` exige que el medicamento esté en esta tabla.
      await conexion.query(`INSERT INTO ronda_medicamento (ronda_id, medicamento_id) VALUES ?`, [
        medicamentoIds.map((id) => [rondaId, id]),
      ]);

      for (const pregunta of preguntas) {
        const [insertada] = await conexion.query<ResultSetHeader>(
          `INSERT INTO pregunta (ronda_id, medicamento_id, atributo, enunciado, orden)
           VALUES (?, ?, ?, ?, ?)`,
          [
            rondaId,
            pregunta.medicamentoId,
            A_COLUMNA[pregunta.tipo],
            pregunta.enunciado,
            pregunta.orden,
          ],
        );

        await conexion.query(
          `INSERT INTO opcion (pregunta_id, texto, es_correcta, orden) VALUES ?`,
          [
            pregunta.opciones.map((o) => [insertada.insertId, o.texto, o.esCorrecta, o.orden]),
          ],
        );
      }

      await conexion.commit();
      return rondaId;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  async obtener(rondaId: number): Promise<Ronda | null> {
    const [rondas] = await this.pool.query<FilaRonda[]>(
      `SELECT id, usuario_id, estado FROM ronda WHERE id = ?`,
      [rondaId],
    );
    const fila = rondas[0];
    if (!fila) return null;

    const [preguntas] = await this.pool.query<FilaPregunta[]>(
      `SELECT p.id, p.medicamento_id, p.atributo, p.enunciado, p.orden,
              r.opcion_id AS opcion_elegida_id
         FROM pregunta p
         LEFT JOIN respuesta r ON r.pregunta_id = p.id
        WHERE p.ronda_id = ?
        ORDER BY p.orden`,
      [rondaId],
    );

    if (preguntas.length === 0) {
      return new Ronda(fila.id, fila.usuario_id, fila.estado, []);
    }

    // Las opciones de todas las preguntas en UNA consulta, no una por pregunta.
    const [opciones] = await this.pool.query<FilaOpcion[]>(
      `SELECT id, pregunta_id, texto, es_correcta, orden
         FROM opcion
        WHERE pregunta_id IN (?)
        ORDER BY orden`,
      [preguntas.map((p) => p.id)],
    );

    const porPregunta = new Map<number, Opcion[]>();
    for (const opcion of opciones) {
      const lista = porPregunta.get(opcion.pregunta_id) ?? [];
      lista.push(new Opcion(opcion.id, opcion.texto, Boolean(opcion.es_correcta), opcion.orden));
      porPregunta.set(opcion.pregunta_id, lista);
    }

    return new Ronda(
      fila.id,
      fila.usuario_id,
      fila.estado,
      preguntas.map(
        (p) =>
          new Pregunta(
            p.id,
            p.medicamento_id,
            A_DOMINIO[p.atributo] ?? "grupoTerapeutico",
            p.enunciado,
            p.orden,
            porPregunta.get(p.id) ?? [],
            p.opcion_elegida_id,
          ),
      ),
    );
  }

  async responder(preguntaId: number, opcionId: number, tiempoMs: number | null): Promise<void> {
    // El UNIQUE sobre pregunta_id impide contestar dos veces; `IGNORE` hace que
    // un doble clic o un F5 no exploten, simplemente no cambien nada.
    await this.pool.query(
      `INSERT IGNORE INTO respuesta (pregunta_id, opcion_id, tiempo_ms) VALUES (?, ?, ?)`,
      [preguntaId, opcionId, tiempoMs],
    );
  }

  async cerrar(rondaId: number, puntos: number): Promise<void> {
    await this.pool.query(
      `UPDATE ronda
          SET estado = 'terminada', puntos = ?, terminada_en = CURRENT_TIMESTAMP
        WHERE id = ? AND estado = 'en_curso'`,
      [puntos, rondaId],
    );
  }
}
