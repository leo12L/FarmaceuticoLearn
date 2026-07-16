import { iniciarSesion } from "@/di/container";

import { errorAHttp, leerJson } from "../_http";

// Inicio de sesión. POST /api/usuarios/login
// Body JSON: { correo, password }. Devuelve el usuario (sin el hash) si acierta.
//
// NOTA(auth): esto verifica las credenciales, pero todavía NO abre sesión: no
// hay cookie ni token. Establecer la sesión es el siguiente paso (ver el
// TODO(auth) en src/di/container.ts).
export async function POST(request: Request) {
  try {
    const cuerpo = await leerJson(request);
    const usuario = await iniciarSesion.run({
      correo: cuerpo.correo,
      password: cuerpo.password,
    });
    return Response.json(usuario.aJSON());
  } catch (error) {
    return errorAHttp(error);
  }
}
