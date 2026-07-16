// El núcleo. Este archivo no importa NADA: ni Next, ni mysql2, ni openFDA.
// Si algún día lo hace, la arquitectura se rompió.

// Las categorías terapéuticas que ofrece el filtro de la enciclopedia.
export const CATEGORIAS_FARMACO = [
  "Analgesia",
  "Antibióticos",
  "Antidiabéticos",
  "Cardiovascular",
  "SNC",
] as const;

export type CategoriaFarmaco = (typeof CATEGORIAS_FARMACO)[number];

// openFDA no nos da una clase terapéutica en los campos que guardamos, pero el
// principio activo la delata. Clasificamos por la raíz del fármaco: es una regla
// de negocio ("qué es cardiovascular"), por eso vive en el dominio y no en la UI.
// Si un fármaco nuevo no encaja en ninguna, se queda sin categoría (solo "Todas").
const CLASIFICACION: { categoria: CategoriaFarmaco; claves: string[] }[] = [
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

export class Medicamento {
  constructor(
    readonly id: number,
    readonly openFdaSetId: string,
    readonly nombreMarca: string | null,
    readonly nombreGenerico: string | null,
    readonly principioActivo: string | null,
    readonly fabricante: string | null,
  ) {}

  // openFDA es irregular: hay etiquetas sin marca comercial y otras sin nombre
  // genérico. Decidir con cuál se muestra la card es una regla del dominio,
  // no algo que deba resolver cada componente de la UI por su cuenta.
  nombre(): string {
    return this.nombreMarca ?? this.nombreGenerico ?? "Medicamento sin nombre";
  }

  // El subtítulo solo se enseña si aporta algo distinto del título.
  subtitulo(): string | null {
    const otro = this.nombreMarca ? this.nombreGenerico : null;
    return otro && otro !== this.nombre() ? otro : null;
  }

  // La categoría terapéutica, deducida del principio activo (o de los nombres).
  // Devuelve null si no encaja en ninguna de las conocidas.
  categoria(): CategoriaFarmaco | null {
    const texto = `${this.principioActivo ?? ""} ${this.nombreGenerico ?? ""} ${this.nombreMarca ?? ""}`.toLowerCase();
    for (const { categoria, claves } of CLASIFICACION) {
      if (claves.some((clave) => texto.includes(clave))) return categoria;
    }
    return null;
  }
}
