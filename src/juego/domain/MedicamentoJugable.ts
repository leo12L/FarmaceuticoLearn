// El juego NO importa del contexto de medicamentos: define su propia vista de
// lo que necesita. Así, si allí cambia la entidad, aquí no se rompe nada.
// Es su puerto quien traduce de un mundo al otro.

// Los grupos terapéuticos que el juego sabe preguntar. Están en español y son
// la única información del catálogo que NO viene en inglés: se deducen del
// principio activo, no se leen de una columna. Duplicamos la clasificación (que
// también vive en el contexto de medicamentos) a propósito: es una regla de
// negocio del juego y no queremos acoplar los dos mundos.
export const CATEGORIAS = [
  "Analgesia",
  "Antibióticos",
  "Antidiabéticos",
  "Cardiovascular",
  "SNC",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

const CLASIFICACION: { categoria: Categoria; claves: string[] }[] = [
  {
    categoria: "Analgesia",
    claves: ["acetaminophen", "paracetamol", "ibuprofen", "naproxen", "aspirin", "ketorolac", "diclofenac", "tramadol", "celecoxib"],
  },
  {
    categoria: "Antibióticos",
    claves: ["amoxicillin", "clavulanate", "penicillin", "ciprofloxacin", "levofloxacin", "azithromycin", "doxycycline", "cephalexin", "cefdinir", "metronidazole", "clindamycin", "ceftriaxone", "nitrofurantoin", "trimethoprim", "sulfamethoxazole"],
  },
  {
    categoria: "Antidiabéticos",
    claves: ["metformin", "glipizide", "glyburide", "glimepiride", "insulin", "sitagliptin", "empagliflozin", "dapagliflozin", "pioglitazone"],
  },
  {
    categoria: "Cardiovascular",
    claves: ["amlodipine", "atorvastatin", "rosuvastatin", "simvastatin", "losartan", "valsartan", "lisinopril", "enalapril", "furosemide", "hydrochlorothiazide", "warfarin", "clopidogrel", "metoprolol", "carvedilol", "atenolol", "diltiazem", "spironolactone", "hydralazine"],
  },
  {
    categoria: "SNC",
    claves: ["sertraline", "fluoxetine", "escitalopram", "citalopram", "paroxetine", "venlafaxine", "duloxetine", "diazepam", "alprazolam", "lorazepam", "clonazepam", "gabapentin", "pregabalin", "quetiapine", "levetiracetam", "amitriptyline", "haloperidol", "bupropion", "zolpidem"],
  },
];

/** Deduce el grupo terapéutico a partir de los nombres. null si no encaja. */
export function clasificar(texto: string): Categoria | null {
  const enMinusculas = texto.toLowerCase();
  for (const { categoria, claves } of CLASIFICACION) {
    if (claves.some((clave) => enMinusculas.includes(clave))) return categoria;
  }
  return null;
}

/**
 * openFDA guarda los nombres a GRITOS y en inglés ("IBUPROFEN", "AMLODIPINE AND
 * ATORVASTATIN"). Para mostrarlos como opción se pasan a Capitalización normal y
 * se traduce el único conector frecuente ("and" → "y"). No es traducir el
 * fármaco —los principios activos son nombres propios casi iguales en ambos
 * idiomas— solo dejar de gritar.
 */
export function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .split(/\s+/)
    .map((palabra) => (palabra === "and" ? "y" : palabra.charAt(0).toUpperCase() + palabra.slice(1)))
    .join(" ")
    .trim();
}

// Los tipos de pregunta que sabe generar el juego. En español y clínicamente
// útiles: a qué grupo pertenece un fármaco y cuál es su principio activo.
export const TIPOS_PREGUNTA = ["grupoTerapeutico", "principioActivo"] as const;
export type TipoPregunta = (typeof TIPOS_PREGUNTA)[number];

export class MedicamentoJugable {
  constructor(
    readonly id: number,
    /** El nombre comercial (de marca): es como se le nombra en la pregunta. */
    readonly nombreMarca: string,
    /** El principio activo: la respuesta correcta de la pregunta de componente. */
    readonly principioActivo: string,
    /** El grupo terapéutico, ya deducido. null si no se pudo clasificar. */
    readonly categoria: Categoria | null,
  ) {}

  /**
   * A qué fármaco pertenece, más allá de la marca. openFDA trae el MISMO
   * principio etiquetado por cada fabricante ("Ibuprofen", "care one ibuprofen"):
   * agruparlos por principio activo evita ofrecer dos marcas del mismo fármaco
   * como opciones distintas.
   */
  familia(): string {
    return this.principioActivo.trim().toLowerCase();
  }

  /**
   * ¿La marca ya delata el principio activo? "care one ibuprofen" → ibuprofen:
   * preguntar por su componente sería regalar la respuesta. En ese caso no
   * ofrecemos la pregunta de principio activo para ese fármaco.
   */
  private principioALaVista(): boolean {
    const raiz = this.principioActivo.toLowerCase().split(/[\s,]+/)[0] ?? "";
    return raiz.length >= 4 && this.nombreMarca.toLowerCase().includes(raiz);
  }

  /** Qué tipos de pregunta se pueden montar sobre este fármaco. */
  tiposDisponibles(): TipoPregunta[] {
    const tipos: TipoPregunta[] = [];
    if (this.categoria !== null) tipos.push("grupoTerapeutico");
    if (!this.principioALaVista()) tipos.push("principioActivo");
    return tipos;
  }
}
