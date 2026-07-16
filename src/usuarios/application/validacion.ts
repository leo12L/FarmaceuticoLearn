import { ErrorDeValidacion } from "../domain/errors";

// Reglas de entrada compartidas entre crear y actualizar. Viven en la capa de
// aplicación porque son de negocio ("un correo tiene que parecer un correo"),
// no de persistencia ni de HTTP.

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

export function validarNombre(nombre: unknown): string {
  if (typeof nombre !== "string" || nombre.trim().length === 0) {
    throw new ErrorDeValidacion("El nombre es obligatorio.");
  }
  if (nombre.trim().length > 120) {
    throw new ErrorDeValidacion("El nombre no puede superar 120 caracteres.");
  }
  return nombre.trim();
}

export function validarCorreo(correo: unknown): string {
  if (typeof correo !== "string" || !CORREO.test(correo)) {
    throw new ErrorDeValidacion("El correo no tiene un formato válido.");
  }
  if (correo.length > 255) {
    throw new ErrorDeValidacion("El correo no puede superar 255 caracteres.");
  }
  return correo.trim().toLowerCase();
}

export function validarPassword(password: unknown): string {
  if (typeof password !== "string" || password.length < PASSWORD_MIN) {
    throw new ErrorDeValidacion(
      `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`,
    );
  }
  return password;
}
