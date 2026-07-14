import type { CampoFicha, Ficha, TextosFicha } from "../domain/Ficha";
import type { MedicamentoRepository } from "../domain/MedicamentoRepository";
import type { TraduccionRepository } from "../domain/TraduccionRepository";
import type { Idioma, Traductor } from "../domain/Traductor";

export class ObtenerFichaMedicamento {
  constructor(
    private readonly repositorio: MedicamentoRepository,
    private readonly traducciones: TraduccionRepository,
    private readonly traductor: Traductor,
  ) {}

  async run(id: number, idioma: Idioma = "es"): Promise<Ficha | null> {
    const ficha = await this.repositorio.obtenerFicha(id);
    if (ficha === null) return null;

    // La ficha viene de openFDA, o sea en inglés. Si alguien la pide en inglés,
    // no hay nada que traducir ni que pagar.
    if (idioma === "en") return ficha;

    const yaTraducidos = await this.traducciones.obtener(id, idioma);

    const faltantes = ficha
      .camposPresentes()
      .filter((campo) => yaTraducidos[campo] === undefined);

    // Todo estaba en caché: cero llamadas a Google, coste cero.
    if (faltantes.length === 0) {
      return ficha.con(yaTraducidos);
    }

    let traducidos: string[];
    try {
      traducidos = await this.traductor.traducir(
        faltantes.map((campo) => ficha.textos[campo] as string),
        idioma,
      );
    } catch (error) {
      // La traducción es un lujo, no un requisito: si el traductor falla (cuota
      // agotada, red caída, key mal puesta), el usuario debe seguir viendo la
      // ficha —en inglés y con lo que sí hubiera en caché— en vez de una página
      // de error. Un fallo del proveedor no puede tumbar la lectura.
      console.error(`No se pudo traducir la ficha ${id}:`, error);
      return ficha.con(yaTraducidos);
    }

    const nuevos = faltantes.map((campo, i) => ({ campo, texto: traducidos[i] }));

    // Se paga una vez y se guarda. La próxima visita ya no llama a Google.
    await this.traducciones.guardar(id, idioma, nuevos);

    const traduccionesNuevas: Partial<Record<CampoFicha, string>> = {};
    for (const { campo, texto } of nuevos) {
      traduccionesNuevas[campo] = texto;
    }

    const textos: TextosFicha = { ...yaTraducidos, ...traduccionesNuevas };
    return ficha.con(textos);
  }
}
