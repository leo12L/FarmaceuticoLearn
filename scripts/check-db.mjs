// Comprueba que el proyecto conecta con MySQL y que el esquema está cargado.
//   node --env-file=.env.local scripts/check-db.mjs
import mysql from "mysql2/promise";

const conexion = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE,
});

const [[version]] = await conexion.query("SELECT VERSION() AS v");
console.log(`Conectado a MySQL ${version.v} (${process.env.MYSQL_DATABASE})`);

const [tablas] = await conexion.query(
  `SELECT table_name AS t FROM information_schema.tables
   WHERE table_schema = ? ORDER BY table_name`,
  [process.env.MYSQL_DATABASE],
);
console.log(`Tablas y vistas (${tablas.length}):`, tablas.map((f) => f.t).join(", ") || "ninguna");

await conexion.end();
