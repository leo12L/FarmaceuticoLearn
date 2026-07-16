// Descarga la estructura molecular de cada fármaco (PubChem, dominio público)
// y la guarda en public/estructuras/<slug>.png. Se hace UNA vez y en serie,
// respetando el rate limit de PubChem, para no depender de su API en cada carga
// de página (que es lo que hacía que muchas tarjetas cayeran al icono).
//
//   node --env-file=.env.local scripts/descargar-estructuras.mjs
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import mysql from "mysql2/promise";

const DIR = join(process.cwd(), "public", "estructuras");
await mkdir(DIR, { recursive: true });

// MISMA normalización que el componente ImagenMedicamento: primer compuesto de
// un combo/lista y a slug. Si cambia una, hay que cambiar la otra.
function slugify(nombre) {
  const base = nombre.toLowerCase().split(/ and |,/)[0].trim();
  return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function baseName(nombre) {
  return nombre.toLowerCase().split(/ and |,/)[0].trim();
}

const c = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE,
});

// Los fármacos deduplicados (mismo criterio que la enciclopedia).
const [filas] = await c.query(
  `SELECT nombre_generico, principio_activo FROM medicamento
    WHERE id IN (SELECT id FROM (SELECT MIN(id) id FROM medicamento
      GROUP BY LOWER(COALESCE(nombre_generico, nombre_marca, CAST(id AS CHAR)))) r)`,
);
await c.end();

const porSlug = new Map();
for (const f of filas) {
  const nombre = f.nombre_generico ?? f.principio_activo;
  if (!nombre) continue;
  const slug = slugify(nombre);
  if (slug && !porSlug.has(slug)) porSlug.set(slug, baseName(nombre));
}

let ok = 0;
let fail = 0;
for (const [slug, nombre] of porSlug) {
  const destino = join(DIR, `${slug}.png`);
  try {
    await access(destino);
    console.log(`= ${slug} (ya existe)`);
    ok++;
    continue;
  } catch {
    // no existe: hay que descargarla
  }
  try {
    const res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(nombre)}/PNG`,
    );
    if (!res.ok) {
      console.log(`✗ ${slug} (HTTP ${res.status})`);
      fail++;
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(destino, buf);
      console.log(`✓ ${slug} (${buf.length} b)`);
      ok++;
    }
  } catch (e) {
    console.log(`✗ ${slug} (${e.message})`);
    fail++;
  }
  // Respeta el rate limit de PubChem (5 req/s): vamos a ~3/s.
  await new Promise((r) => setTimeout(r, 320));
}

console.log(`\nGuardadas/existentes: ${ok} · sin estructura: ${fail}`);
