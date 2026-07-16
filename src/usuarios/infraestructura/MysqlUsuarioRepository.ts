import "server-only";

import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Usuario } from "../domain/Usuario";
import type {
  Credencial,
  DatosNuevoUsuario,
  UsuarioRepository,
} from "../domain/UsuarioRepository";
import { CorreoEnUso } from "../domain/errors";

// La fila cruda de MySQL. No sale de este archivo: se traduce a la entidad
// `Usuario` antes de devolver nada. `password_hash` se lee/escribe aquí, pero
// nunca viaja dentro de la entidad.
interface FilaUsuario extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string;
  creado_en: Date;
}

// mysql2 marca los choques con el UNIQUE de `correo` con este código.
function esCorreoDuplicado(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export class MysqlUsuarioRepository implements UsuarioRepository {
  constructor(private readonly pool: Pool) {}

  async crear(datos: DatosNuevoUsuario): Promise<Usuario> {
    try {
      const [resultado] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO usuario (nombre, correo, password_hash) VALUES (?, ?, ?)`,
        [datos.nombre, datos.correo, datos.passwordHash],
      );
      // Releemos la fila para devolver la entidad con su `creado_en` real.
      const [filas] = await this.pool.query<FilaUsuario[]>(
        `SELECT id, nombre, correo, password_hash, creado_en FROM usuario WHERE id = ?`,
        [resultado.insertId],
      );
      const fila = filas[0]!;
      return new Usuario(fila.id, fila.nombre, fila.correo, new Date(fila.creado_en));
    } catch (error) {
      if (esCorreoDuplicado(error)) throw new CorreoEnUso(datos.correo);
      throw error;
    }
  }

  async buscarCredencialPorCorreo(correo: string): Promise<Credencial | null> {
    const [filas] = await this.pool.query<FilaUsuario[]>(
      `SELECT id, nombre, correo, password_hash, creado_en FROM usuario WHERE correo = ?`,
      [correo],
    );
    const fila = filas[0];
    if (!fila) return null;

    return {
      usuario: new Usuario(fila.id, fila.nombre, fila.correo, new Date(fila.creado_en)),
      passwordHash: fila.password_hash,
    };
  }
}
