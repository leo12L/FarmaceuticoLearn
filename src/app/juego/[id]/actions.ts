"use server";

import { revalidatePath } from "next/cache";

import { responderPregunta } from "@/di/container";

export async function responderAction(formData: FormData) {
  const rondaId = Number(formData.get("rondaId"));
  const preguntaId = Number(formData.get("preguntaId"));
  const opcionId = Number(formData.get("opcion"));

  // Sin opción elegida no hay nada que registrar.
  if (!opcionId) return;

  await responderPregunta.run(rondaId, preguntaId, opcionId);

  // La página vuelve a renderizarse y `preguntaActual()` ya devuelve la siguiente.
  revalidatePath(`/juego/${rondaId}`);
}
