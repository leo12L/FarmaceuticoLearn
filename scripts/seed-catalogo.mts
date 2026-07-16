// Puebla el catálogo con una selección variada de fármacos comunes, cubriendo
// las categorías del filtro. Uso puntual:
//   node --conditions=react-server --import tsx --env-file=.env.local scripts/seed-catalogo.mts
import { sincronizarMedicamentos } from "@/di/container";
import { pool } from "@/shared/infraestructura/mysql/pool";

const TERMINOS = [
  // Analgesia
  "ibuprofen", "naproxen", "ketorolac", "aspirin", "celecoxib",
  // Antibióticos
  "azithromycin", "doxycycline", "cephalexin", "metronidazole", "nitrofurantoin",
  // Antidiabéticos
  "glipizide", "sitagliptin", "empagliflozin", "pioglitazone",
  // Cardiovascular
  "lisinopril", "metoprolol", "simvastatin", "clopidogrel", "valsartan", "spironolactone",
  // SNC
  "fluoxetine", "escitalopram", "gabapentin", "alprazolam", "quetiapine",
];

let total = 0;
for (const termino of TERMINOS) {
  try {
    const r = await sincronizarMedicamentos.run(termino, 3);
    total += r.guardadas;
    console.log(`${termino.padEnd(16)} +${r.guardadas}`);
  } catch (e) {
    console.log(`${termino.padEnd(16)} error: ${(e as Error).message}`);
  }
}
console.log(`\nTotal guardadas: ${total}`);
await pool.end();
