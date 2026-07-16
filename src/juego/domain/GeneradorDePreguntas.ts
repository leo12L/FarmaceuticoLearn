import {
  CATEGORIAS,
  type MedicamentoJugable,
  normalizarNombre,
  type TipoPregunta,
} from "./MedicamentoJugable";
import { Opcion, Pregunta } from "./Ronda";

export const OPCIONES_POR_PREGUNTA = 4;
export const MINIMO_MEDICAMENTOS = OPCIONES_POR_PREGUNTA;

/** Inyectable para poder testear con un azar predecible. */
export type Aleatorio = () => number;

export class MedicamentosInsuficientes extends Error {
  constructor(familias: number) {
    super(
      `Hacen falta al menos ${MINIMO_MEDICAMENTOS} fármacos DISTINTOS para montar una ronda ` +
        `(los elegidos suman ${familias}). Ojo: varias marcas del mismo principio activo ` +
        `cuentan como uno solo, o las opciones serían indistinguibles.`,
    );
  }
}

/** Cuántos fármacos realmente distintos hay, ignorando marcas repetidas. */
export function familiasDistintas(medicamentos: readonly MedicamentoJugable[]): number {
  return new Set(medicamentos.map((m) => m.familia())).size;
}

function barajar<T>(items: readonly T[], aleatorio: Aleatorio): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// El texto de la pregunta, ya en español y nombrando al fármaco. Es
// autocontenido: se guarda tal cual y se muestra sin más adornos.
const ENUNCIADO: Record<TipoPregunta, (m: MedicamentoJugable) => string> = {
  grupoTerapeutico: (m) =>
    `¿A qué grupo terapéutico pertenece ${normalizarNombre(m.principioActivo)}?`,
  principioActivo: (m) => `¿Cuál es el principio activo de ${normalizarNombre(m.nombreMarca)}?`,
};

/**
 * Las opciones (una correcta + tres distractores) de una pregunta.
 *
 * - grupoTerapeutico: los distractores son OTROS grupos terapéuticos. Siempre
 *   hay de sobra: solo existen cinco categorías.
 * - principioActivo: los distractores son principios de OTROS fármacos, nunca
 *   dos marcas del mismo. Por eso una ronda necesita fármacos bien distintos.
 */
function opcionesDe(
  tipo: TipoPregunta,
  medicamento: MedicamentoJugable,
  medicamentos: readonly MedicamentoJugable[],
  aleatorio: Aleatorio,
): Opcion[] {
  let correcta: string;
  let distractores: string[];

  if (tipo === "grupoTerapeutico") {
    correcta = medicamento.categoria as string;
    distractores = barajar(
      CATEGORIAS.filter((c) => c !== correcta),
      aleatorio,
    ).slice(0, OPCIONES_POR_PREGUNTA - 1);
  } else {
    correcta = normalizarNombre(medicamento.principioActivo);
    const yaUsadas = new Set([medicamento.familia()]);
    distractores = barajar(medicamentos, aleatorio)
      .filter((otro) => {
        if (yaUsadas.has(otro.familia())) return false;
        yaUsadas.add(otro.familia());
        return true;
      })
      .slice(0, OPCIONES_POR_PREGUNTA - 1)
      .map((otro) => normalizarNombre(otro.principioActivo));
  }

  return barajar(
    [
      new Opcion(null, correcta, true, 0),
      ...distractores.map((texto) => new Opcion(null, texto, false, 0)),
    ],
    aleatorio,
  ).map((opcion, i) => new Opcion(null, opcion.texto, opcion.esCorrecta, i + 1));
}

/**
 * Genera las preguntas de una ronda.
 *
 * El formato es "sobre un fármaco con nombre, ¿qué es cierto de él?": se nombra
 * el medicamento y se elige entre cuatro respuestas cortas, todo en español. No
 * se muestra prosa del prospecto (que openFDA solo da en inglés): se pregunta
 * por datos estructurados —grupo terapéutico y principio activo—.
 */
export function generarPreguntas(
  medicamentos: readonly MedicamentoJugable[],
  cantidad: number,
  aleatorio: Aleatorio = Math.random,
): Pregunta[] {
  if (familiasDistintas(medicamentos) < MINIMO_MEDICAMENTOS) {
    throw new MedicamentosInsuficientes(familiasDistintas(medicamentos));
  }

  // Todas las combinaciones posibles de (medicamento, tipo de pregunta). Cada
  // una da como mucho una pregunta: preguntar dos veces lo mismo la repetiría.
  const candidatas: Array<{ medicamento: MedicamentoJugable; tipo: TipoPregunta }> = [];
  for (const medicamento of medicamentos) {
    for (const tipo of medicamento.tiposDisponibles()) {
      candidatas.push({ medicamento, tipo });
    }
  }

  const elegidas = barajar(candidatas, aleatorio).slice(0, cantidad);

  return elegidas.map(({ medicamento, tipo }, indice) => {
    return new Pregunta(
      null,
      medicamento.id,
      tipo,
      ENUNCIADO[tipo](medicamento),
      indice + 1,
      opcionesDe(tipo, medicamento, medicamentos, aleatorio),
    );
  });
}

/** Cuántas preguntas se pueden montar como mucho con estos medicamentos. */
export function preguntasPosibles(medicamentos: readonly MedicamentoJugable[]): number {
  return medicamentos.reduce((total, m) => total + m.tiposDisponibles().length, 0);
}
