// Si este módulo acaba importado por accidente desde un Client Component,
// `server-only` rompe el build en vez de filtrar las credenciales al navegador.
import "server-only";

import mysql, { type Pool } from "mysql2/promise";

function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copia .env.example a .env.local y rellénala.`,
    );
  }
  return valor;
}

function crearPool(): Pool {
  return mysql.createPool({
    host: requerido("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: requerido("MYSQL_USER"),
    // La contraseña sí puede estar vacía (típico de un root local en XAMPP),
    // así que no pasa por `requerido`.
    password: process.env.MYSQL_PASSWORD ?? "",
    database: requerido("MYSQL_DATABASE"),

    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
    queueLimit: 0,

    charset: "utf8mb4_unicode_ci",
    // Las fechas viajan en UTC; la localización es cosa de la UI, no de la base.
    timezone: "Z",
  });
}

// En dev, Next recarga los módulos en cada cambio. Sin este singleton en
// `globalThis`, cada recarga crearía un pool nuevo y las conexiones se irían
// acumulando hasta agotar el `max_connections` de MySQL.
const globalParaPool = globalThis as typeof globalThis & {
  __mysqlPool?: Pool;
};

export const pool: Pool = globalParaPool.__mysqlPool ?? crearPool();

if (process.env.NODE_ENV !== "production") {
  globalParaPool.__mysqlPool = pool;
}
