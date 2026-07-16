import type { Hasher } from "../domain/Hasher";
import type { Usuario } from "../domain/Usuario";
import type { UsuarioRepository } from "../domain/UsuarioRepository";
import { CredencialesInvalidas } from "../domain/errors";

export interface EntradaIniciarSesion {
  correo: unknown;
  password: unknown;
}

export class IniciarSesion {
  constructor(
    private readonly repositorio: UsuarioRepository,
    private readonly hasher: Hasher,
  ) {}

  async run(entrada: EntradaIniciarSesion): Promise<Usuario> {
    // En login NO aplicamos las reglas de "contraseña de al menos 8": eso es para
    // fijar una contraseña, no para escribirla. Solo exigimos que vengan ambas.
    if (typeof entrada.correo !== "string" || typeof entrada.password !== "string") {
      throw new CredencialesInvalidas();
    }
    const correo = entrada.correo.trim().toLowerCase();

    const credencial = await this.repositorio.buscarCredencialPorCorreo(correo);
    // Mismo error tanto si el correo no existe como si la contraseña no coincide:
    // no filtramos qué correos están registrados.
    if (!credencial) throw new CredencialesInvalidas();

    const ok = await this.hasher.verificar(entrada.password, credencial.passwordHash);
    if (!ok) throw new CredencialesInvalidas();

    return credencial.usuario;
  }
}
