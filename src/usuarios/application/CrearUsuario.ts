import type { Hasher } from "../domain/Hasher";
import type { Usuario } from "../domain/Usuario";
import type { UsuarioRepository } from "../domain/UsuarioRepository";
import { validarCorreo, validarNombre, validarPassword } from "./validacion";

export interface EntradaCrearUsuario {
  nombre: unknown;
  correo: unknown;
  password: unknown;
}

export class CrearUsuario {
  constructor(
    private readonly repositorio: UsuarioRepository,
    private readonly hasher: Hasher,
  ) {}

  async run(entrada: EntradaCrearUsuario): Promise<Usuario> {
    const nombre = validarNombre(entrada.nombre);
    const correo = validarCorreo(entrada.correo);
    const password = validarPassword(entrada.password);

    // La contraseña en claro no pasa de aquí: se hashea antes de tocar el repo.
    const passwordHash = await this.hasher.hash(password);

    return this.repositorio.crear({ nombre, correo, passwordHash });
  }
}
