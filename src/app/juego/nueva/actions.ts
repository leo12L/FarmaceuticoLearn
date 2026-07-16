"use server";

import { redirect } from "next/navigation";

import { crearRonda, USUARIO_DEMO_ID } from "@/di/container";
import { MedicamentosInsuficientes } from "@/juego/domain/GeneradorDePreguntas";

export async function crearRondaAction(formData: FormData) {
  const medicamentoIds = formData
    .getAll("medicamento")
    .map((valor) => Number(valor))
    .filter((id) => Number.isInteger(id) && id > 0);

  const preguntas = Number(formData.get("preguntas") ?? 10);

  let rondaId: number;
  try {
    rondaId = await crearRonda.run(USUARIO_DEMO_ID, medicamentoIds, preguntas);
  } catch (error) {
    // Elegir pocos fármacos distintos es un error del usuario, no un fallo del
    // sistema: se le explica y vuelve a la pantalla, no se le enseña un stack.
    if (error instanceof MedicamentosInsuficientes) {
      redirect(`/juego/nueva?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  // Fuera del try/catch: `redirect` corta la ejecución lanzando.
  redirect(`/juego/${rondaId}`);
}
