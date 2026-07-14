// Sincroniza medicamentos desde openFDA hacia la caché de MySQL.
//   npm run sync -- ibuprofen
//   npm run sync -- "amoxicillin" 50
//
// Es un adapter primario más: igual que una página, lo único que hace es
// invocar el caso de uso. La lógica no vive aquí.
import { sincronizarMedicamentos } from "@/di/container";
import { pool } from "@/shared/infraestructura/mysql/pool";

const [termino, limite] = process.argv.slice(2);

if (!termino) {
  console.error('Uso: npm run sync -- <termino> [limite]\nEjemplo: npm run sync -- ibuprofen 25');
  process.exit(1);
}

const resultado = await sincronizarMedicamentos.run(
  termino,
  limite ? Number(limite) : undefined,
);

console.log(
  `«${termino}»: ${resultado.descargadas} descargadas, ` +
    `${resultado.guardadas} guardadas, ${resultado.descartadas} descartadas (sin nombre).`,
);

await pool.end();
