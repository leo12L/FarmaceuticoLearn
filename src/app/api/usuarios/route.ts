import { crearUsuario } from "@/di/container";

import { errorAHttp, leerJson } from "./_http";

// Registro de usuario. POST /api/usuarios
// Body JSON: { nombre, correo, password }.
export async function POST(request: Request) {
  try {
    const cuerpo = await leerJson(request);
    const usuario = await crearUsuario.run({
      nombre: cuerpo.nombre,
      correo: cuerpo.correo,
      password: cuerpo.password,
    });
    return Response.json(usuario.aJSON(), { status: 201 });
  } catch (error) {
    return errorAHttp(error);
  }
}
