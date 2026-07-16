// Resúmenes limpios de "para qué sirve" cada fármaco, redactados a mano a partir
// de sus indicaciones reales. Son cortos, en español llano y —a propósito— NO
// nombran el fármaco, para poder usarlos como pista en el juego (formato "¿a qué
// fármaco corresponde esta descripción?").
//
// La clave es el nombre normalizado: openFDA trae el mismo principio activo con
// distintas sales y presentaciones ("ciprofloxacin" vs "ciprofloxacin
// hydrochloride"), y aquí todas caen en la misma entrada. Los combos ("X and Y")
// tienen su propia entrada como "x + y".

const SALES = new Set([
  "hydrochloride", "hcl", "sulfate", "bisulfate", "succinate", "tartrate",
  "sodium", "potassium", "magnesium", "fumarate", "tromethamine", "calcium",
  "besylate", "monohydrate", "macrocrystals", "dihydrate", "hyclate", "maleate",
  "mesylate", "acetate", "chloride", "benzalkonium",
]);
const FORMAS = new Set([
  "tablets", "tablet", "oral", "topical", "er", "xl", "xr", "hfa", "solution",
  "extended", "release", "mg",
]);

function limpiarParte(parte: string): string {
  return parte
    .split(/\s+/)
    .filter((palabra) => palabra && !SALES.has(palabra) && !FORMAS.has(palabra) && !/^\d/.test(palabra))
    .join(" ")
    .trim();
}

/** Normaliza un nombre a la clave con la que se buscan los resúmenes. */
export function claveResumen(nombre: string): string {
  let s = nombre.toLowerCase().trim();
  s = s.split(",")[0]; // "furosemide, benzalkonium chloride" -> "furosemide"
  s = s.replace(/\(.*?\)/g, " "); // quita "(monohydrate/macrocrystals)"
  const partes = s
    .split(/\s+and\s+/)
    .map(limpiarParte)
    .filter(Boolean);
  return partes.join(" + ");
}

const RESUMENES: Record<string, string> = {
  acetaminophen: "Alivia el dolor leve o moderado y baja la fiebre. No es antiinflamatorio.",
  albuterol: "Broncodilatador de acción rápida: abre las vías respiratorias para aliviar el ahogo en asma y EPOC.",
  alprazolam: "Ansiolítico (benzodiacepina) para la ansiedad y las crisis de pánico.",
  "amlodipine + atorvastatin": "Combina un fármaco para la tensión alta y otro para el colesterol: relaja las arterias y baja el colesterol.",
  amoxicillin: "Antibiótico para infecciones bacterianas comunes de oído, garganta, vías respiratorias y urinarias.",
  "amoxicillin + clavulanate": "Antibiótico reforzado para infecciones bacterianas que resisten a la penicilina simple.",
  aspirin: "Alivia dolor y fiebre y, en dosis baja, previene infartos y trombos al hacer la sangre menos espesa.",
  atorvastatin: "Reduce el colesterol 'malo' (LDL) para prevenir infartos e ictus.",
  azithromycin: "Antibiótico para infecciones respiratorias y algunas de transmisión sexual; pauta corta de pocos días.",
  celecoxib: "Antiinflamatorio para el dolor y la inflamación de la artritis, con menos daño al estómago.",
  cephalexin: "Antibiótico para infecciones de piel, vías urinarias y respiratorias.",
  ciprofloxacin: "Antibiótico de amplio espectro para infecciones urinarias, digestivas y respiratorias.",
  clopidogrel: "Antiagregante: evita que las plaquetas formen coágulos, previniendo infartos e ictus.",
  doxycycline: "Antibiótico para infecciones respiratorias, de piel, acné y algunas de transmisión sexual.",
  empagliflozin: "Antidiabético que baja el azúcar eliminándolo por la orina; también protege corazón y riñón.",
  "empagliflozin + metformin": "Combinación para la diabetes tipo 2: baja el azúcar por dos mecanismos distintos.",
  escitalopram: "Antidepresivo (ISRS) para la depresión y la ansiedad.",
  "ezetimibe + simvastatin": "Combinación que baja el colesterol bloqueando a la vez su absorción y su producción.",
  fluoxetine: "Antidepresivo (ISRS) para depresión, trastorno obsesivo-compulsivo y bulimia.",
  furosemide: "Diurético potente: elimina el exceso de líquido para tratar edemas e hipertensión.",
  gabapentin: "Calma el dolor de origen nervioso (neuropático) y ayuda a controlar crisis epilépticas.",
  glipizide: "Antidiabético oral que estimula al páncreas a liberar más insulina.",
  ibuprofen: "Antiinflamatorio para el dolor, la fiebre y la inflamación.",
  ketorolac: "Antiinflamatorio potente para el dolor agudo, de uso corto.",
  "lisinopril + hydrochlorothiazide": "Combinación para la hipertensión: relaja las arterias y elimina líquido con un diurético.",
  losartan: "Baja la tensión relajando los vasos sanguíneos; además protege el riñón en personas con diabetes.",
  "losartan + hydrochlorothiazide": "Combinación para la hipertensión: relaja los vasos y elimina líquido con un diurético.",
  metformin: "Antidiabético de primera línea: baja el azúcar reduciendo su producción en el hígado.",
  metoprolol: "Betabloqueante: baja la frecuencia cardíaca y la tensión; protege el corazón tras un infarto.",
  metronidazole: "Antibiótico y antiparasitario para infecciones por bacterias anaerobias y ciertos parásitos.",
  naproxen: "Antiinflamatorio de acción prolongada para el dolor y la inflamación.",
  nitrofurantoin: "Antibiótico específico para las infecciones de orina (cistitis).",
  omeprazole: "Reduce el ácido del estómago; trata el reflujo y las úlceras.",
  pioglitazone: "Antidiabético que mejora la sensibilidad del cuerpo a la insulina.",
  prednisone: "Corticoide que reduce la inflamación y calma el sistema inmunitario en muchas enfermedades.",
  quetiapine: "Antipsicótico para la esquizofrenia y el trastorno bipolar; a veces apoya el tratamiento de la depresión.",
  "sacubitril + valsartan": "Combinación para la insuficiencia cardíaca: alivia la carga de trabajo del corazón.",
  sertraline: "Antidepresivo (ISRS) para la depresión, la ansiedad y el trastorno de pánico.",
  simvastatin: "Reduce el colesterol 'malo' para prevenir problemas cardiovasculares.",
  sitagliptin: "Antidiabético que aumenta la insulina después de las comidas y baja el azúcar.",
  "sitagliptin + metformin": "Combinación para la diabetes tipo 2 que baja el azúcar por dos vías.",
  spironolactone: "Diurético que elimina líquido sin perder potasio; útil en insuficiencia cardíaca e hipertensión.",
  "spironolactone + hydrochlorothiazide": "Combinación diurética para eliminar líquido y bajar la tensión, cuidando el potasio.",
  valsartan: "Baja la tensión relajando los vasos sanguíneos; útil en hipertensión e insuficiencia cardíaca.",
  "valsartan + hydrochlorothiazide": "Combinación para la hipertensión: relaja los vasos y elimina líquido con un diurético.",
  warfarin: "Anticoagulante: hace la sangre más fluida para prevenir y tratar trombos.",
};

/** El resumen de "para qué sirve", o null si no hay uno redactado para ese fármaco. */
export function resumenIndicaciones(nombre: string | null | undefined): string | null {
  if (!nombre) return null;
  return RESUMENES[claveResumen(nombre)] ?? null;
}
