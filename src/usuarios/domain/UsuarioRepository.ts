import type { Usuario } from "./Usuario";

// EL PUERTO. El dominio dice qué operaciones necesita sobre usuarios; que las
// cumpla MySQL hoy o un mock en los tests es cosa de infraestructura.

export interface DatosNuevoUsuario {
  readonly nombre: string;
  readonly correo: string;
  /** Ya viene hasheada: el repositorio nunca ve la contraseña en claro. */
  readonly passwordHash: string;
}

// Para el login: el usuario junto a su hash. El hash sale del repositorio SOLO
// aquí y solo para comparar en el caso de uso; nunca entra en la entidad
// `Usuario` ni viaja al exterior.
export interface Credencial {
  readonly usuario: Usuario;
  readonly passwordHash: string;
}

export interface UsuarioRepository {
  /**
   * Registra el usuario y lo devuelve ya con id y fecha.
   * Lanza `CorreoEnUso` si el correo choca con el UNIQUE de la tabla.
   */
  crear(datos: DatosNuevoUsuario): Promise<Usuario>;

  /** Busca por correo para autenticar. `null` si no existe ese correo. */
  buscarCredencialPorCorreo(correo: string): Promise<Credencial | null>;
}
