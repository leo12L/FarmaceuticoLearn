// Datos de prueba TEMPORALES para ver el catálogo funcionando.
// Se borran solos cuando llegue la sincronización real desde openFDA.
//   node --env-file=.env.local scripts/seed-demo.mjs
import mysql from "mysql2/promise";

const MEDICAMENTOS = [
  ["demo-ibuprofeno", "Advil", "Ibuprofen", "Ibuprofen 200 mg", "Pfizer"],
  ["demo-paracetamol", "Tylenol", "Acetaminophen", "Acetaminophen 500 mg", "Johnson & Johnson"],
  ["demo-omeprazol", "Prilosec", "Omeprazole", "Omeprazole 20 mg", "AstraZeneca"],
  ["demo-amoxicilina", null, "Amoxicillin", "Amoxicillin 500 mg", "Sandoz"],
  ["demo-metformina", "Glucophage", "Metformin", "Metformin hydrochloride 850 mg", "Merck"],
  ["demo-atorvastatina", "Lipitor", "Atorvastatin", "Atorvastatin calcium 20 mg", "Pfizer"],
];

const conexion = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE,
});

for (const fila of MEDICAMENTOS) {
  await conexion.execute(
    `INSERT INTO medicamento
       (openfda_set_id, nombre_marca, nombre_generico, principio_activo, fabricante)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nombre_marca = VALUES(nombre_marca)`,
    fila,
  );
}

const [[conteo]] = await conexion.query("SELECT COUNT(*) AS n FROM medicamento");
console.log(`Listo. La tabla medicamento tiene ${conteo.n} filas.`);

await conexion.end();
