import type { TipoPregunta } from "./MedicamentoJugable";

export type EstadoRonda = "en_curso" | "terminada" | "abandonada";

export const PUNTOS_POR_ACIERTO = 10;

export class Opcion {
  constructor(
    /** null mientras no se ha guardado en la base. */
    readonly id: number | null,
    readonly texto: string,
    readonly esCorrecta: boolean,
    readonly orden: number,
  ) {}
}

export class Pregunta {
  constructor(
    readonly id: number | null,
    /** Sobre qué medicamento va: es la respuesta correcta. */
    readonly medicamentoId: number,
    readonly tipo: TipoPregunta,
    readonly enunciado: string,
    readonly orden: number,
    readonly opciones: readonly Opcion[],
    /** La opción que eligió el usuario, o null si aún no ha contestado. */
    readonly opcionElegidaId: number | null = null,
  ) {}

  respondida(): boolean {
    return this.opcionElegidaId !== null;
  }

  acertada(): boolean {
    const elegida = this.opciones.find((o) => o.id === this.opcionElegidaId);
    return elegida?.esCorrecta ?? false;
  }
}

export class Ronda {
  constructor(
    readonly id: number | null,
    readonly usuarioId: number,
    readonly estado: EstadoRonda,
    readonly preguntas: readonly Pregunta[],
  ) {}

  /** La primera sin contestar: es la que toca jugar ahora. */
  preguntaActual(): Pregunta | null {
    return this.preguntas.find((pregunta) => !pregunta.respondida()) ?? null;
  }

  haTerminado(): boolean {
    return this.preguntaActual() === null;
  }

  aciertos(): number {
    return this.preguntas.filter((pregunta) => pregunta.acertada()).length;
  }

  /**
   * Los puntos se calculan aquí y se guardan al cerrar la ronda. No es un dato
   * duplicado: es un hecho histórico. Si mañana cambia la fórmula, las rondas
   * viejas deben conservar lo que el usuario ganó de verdad.
   */
  puntos(): number {
    return this.aciertos() * PUNTOS_POR_ACIERTO;
  }
}
