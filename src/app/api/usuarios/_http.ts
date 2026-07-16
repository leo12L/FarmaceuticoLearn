import {
  CorreoEnUso,
  CredencialesInvalidas,
  ErrorDeValidacion,
} from "@/usuarios/domain/errors";

// Traducción de errores del dominio a HTTP. Vive en la capa web (por eso está
// bajo `app/`, no en el dominio) y centraliza el mapeo para que los tres
// handlers no lo repitan. El guion bajo del nombre deja claro que no es un
// `route.ts`: Next solo trata como endpoint los archivos llamados `route`.
export function errorAHttp(error: unknown): Response {
  if (error instanceof ErrorDeValidacion) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof CorreoEnUso) {
    return Response.json({ error: error.message }, { status: 409 });
  }
  if (error instanceof CredencialesInvalidas) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  // Cualquier otra cosa es un fallo nuestro: no filtramos el detalle al cliente.
  console.error("[api/usuarios] error inesperado:", error);
  return Response.json({ error: "Error interno del servidor." }, { status: 500 });
}

// Parsea el body como JSON sin reventar si viene vacío o malformado.
export async function leerJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const cuerpo = await request.json();
    return typeof cuerpo === "object" && cuerpo !== null
      ? (cuerpo as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

// El id de la URL llega como string; lo queremos como entero positivo o nada.
export function parsearId(valor: string): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}
