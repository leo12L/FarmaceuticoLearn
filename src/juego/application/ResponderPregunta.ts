import type { RondaRepository } from "../domain/RondaRepository";
import type { Ronda } from "../domain/Ronda";

export class ResponderPregunta {
  constructor(private readonly repositorio: RondaRepository) {}

  async run(
    rondaId: number,
    preguntaId: number,
    opcionId: number,
    tiempoMs: number | null = null,
  ): Promise<Ronda> {
    await this.repositorio.responder(preguntaId, opcionId, tiempoMs);

    // Se relee la ronda ya con la respuesta puesta: quién acertó y cuántos
    // puntos vale lo decide el dominio, no una cuenta hecha aquí a mano.
    const ronda = await this.repositorio.obtener(rondaId);
    if (ronda === null) {
      throw new Error(`La ronda ${rondaId} no existe.`);
    }

    // Era la última: se cierra y se congelan los puntos.
    if (ronda.haTerminado() && ronda.estado === "en_curso") {
      await this.repositorio.cerrar(rondaId, ronda.puntos());
      // Se relee: si devolviéramos el objeto de antes, diría "en_curso" cuando
      // la base ya la tiene cerrada. Un caso de uso no puede devolver un
      // estado que contradice a la base.
      return (await this.repositorio.obtener(rondaId)) ?? ronda;
    }

    return ronda;
  }
}
