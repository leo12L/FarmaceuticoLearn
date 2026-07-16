import type { Pregunta, Ronda } from "./Ronda";

export interface RondaRepository {
  /**
   * Guarda la ronda entera: la ronda, los medicamentos elegidos, las preguntas
   * y sus opciones. Todo o nada: una ronda a medio crear no sirve para nada.
   * Devuelve el id de la ronda creada.
   */
  crear(
    usuarioId: number,
    medicamentoIds: readonly number[],
    preguntas: readonly Pregunta[],
  ): Promise<number>;

  obtener(rondaId: number): Promise<Ronda | null>;

  /** Registra la respuesta del usuario a una pregunta. */
  responder(preguntaId: number, opcionId: number, tiempoMs: number | null): Promise<void>;

  /** Cierra la ronda y congela los puntos conseguidos. */
  cerrar(rondaId: number, puntos: number): Promise<void>;
}
