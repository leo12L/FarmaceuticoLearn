// Errores del dominio: los casos de uso los lanzan sin saber nada de HTTP.
// Es el route handler quien decide que `ErrorDeValidacion` es un 400 y que
// `CorreoEnUso` es un 409. Así el dominio no depende de la capa web.

export class ErrorDeValidacion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorDeValidacion";
  }
}

export class CorreoEnUso extends Error {
  constructor(correo: string) {
    super(`El correo ${correo} ya está registrado.`);
    this.name = "CorreoEnUso";
  }
}

// Login fallido. A propósito NO dice si falló el correo o la contraseña: contar
// cuál de los dos estaba mal le regala a un atacante qué correos existen.
export class CredencialesInvalidas extends Error {
  constructor() {
    super("Correo o contraseña incorrectos.");
    this.name = "CredencialesInvalidas";
  }
}
