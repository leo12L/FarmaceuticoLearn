// EL PUERTO de hashing. El dominio declara que necesita "convertir una
// contraseña en algo que se puede guardar y comparar", no con qué algoritmo.
// Hoy lo cumple scrypt (node:crypto, cero dependencias); cambiarlo por bcrypt
// o argon2 es cambiar el adapter en el composition root, nada más. Igual que
// `Traductor` con las traducciones.
export interface Hasher {
  /** Deriva un hash almacenable a partir de la contraseña en claro. */
  hash(passwordPlano: string): Promise<string>;

  /** Comprueba una contraseña contra un hash previamente generado. */
  verificar(passwordPlano: string, hash: string): Promise<boolean>;
}
