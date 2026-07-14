"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sincronizarMedicamentos } from "@/di/container";

// Adapter primario, igual que una página: lee la entrada, llama al caso de uso
// y refresca la UI. Cero lógica de negocio, cero SQL.
//
// OJO: las Server Actions son endpoints POST públicos, alcanzables sin pasar
// por este formulario. Cuando exista login, la autorización va AQUÍ dentro
// (o en el caso de uso), nunca solo escondiendo el botón.
export async function sincronizarDesdeOpenFda(formData: FormData) {
  const termino = String(formData.get("termino") ?? "").trim();
  if (!termino) return;

  await sincronizarMedicamentos.run(termino);

  revalidatePath("/medicamentos");
  // `redirect` lanza internamente para cortar la ejecución: tiene que quedar
  // fuera de cualquier try/catch.
  redirect(`/medicamentos?q=${encodeURIComponent(termino)}`);
}
