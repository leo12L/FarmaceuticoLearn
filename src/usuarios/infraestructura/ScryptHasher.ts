import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import type { Hasher } from "../domain/Hasher";

const scryptAsync = promisify(scrypt);
const LONGITUD_CLAVE = 64;

/**
 * Adapter de hashing con scrypt, que viene en el propio Node: cero
 * dependencias. El formato guardado es `salt:hashHex` (161 caracteres, cabe de
 * sobra en el VARCHAR(255) de `password_hash`).
 *
 * Si algún día se quiere bcrypt/argon2, se escribe otro adapter que cumpla
 * `Hasher` y se cambia la línea del composition root: el dominio no se entera.
 */
export class ScryptHasher implements Hasher {
  async hash(passwordPlano: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivada = (await scryptAsync(passwordPlano, salt, LONGITUD_CLAVE)) as Buffer;
    return `${salt}:${derivada.toString("hex")}`;
  }

  async verificar(passwordPlano: string, hash: string): Promise<boolean> {
    const [salt, claveHex] = hash.split(":");
    if (!salt || !claveHex) return false;

    const claveGuardada = Buffer.from(claveHex, "hex");
    const derivada = (await scryptAsync(passwordPlano, salt, LONGITUD_CLAVE)) as Buffer;

    // Comparación en tiempo constante: no filtra por cuánto tarda cuántos bytes
    // coincidían. `timingSafeEqual` exige longitudes iguales, de ahí el guard.
    return (
      claveGuardada.length === derivada.length && timingSafeEqual(claveGuardada, derivada)
    );
  }
}
