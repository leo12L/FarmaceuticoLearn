import type { Idioma, Traductor } from "../domain/Traductor";

const ENDPOINT = "https://api.mymemory.translated.net/get";

// MyMemory corta en 500 BYTES por petición (no caracteres: los acentos ocupan
// dos). Dejamos margen para no rozar el límite.
const LIMITE_BYTES = 460;

function bytes(texto: string): number {
  return new TextEncoder().encode(texto).length;
}

interface RespuestaMyMemory {
  responseStatus?: number | string;
  responseDetails?: string;
  quotaFinished?: boolean;
  responseData?: { translatedText?: string };
}

/**
 * Parte un párrafo en trozos de como mucho `LIMITE_BYTES`, cortando por final
 * de frase. Partir a ciegas cada 500 bytes rompería frases por la mitad y el
 * traductor devolvería basura: el contexto de una frase incompleta se pierde.
 */
function trocear(parrafo: string): string[] {
  if (bytes(parrafo) <= LIMITE_BYTES) return [parrafo];

  const trozos: string[] = [];
  let actual = "";

  // Corta detrás de . ; : ! ? sin comerse el signo.
  for (const frase of parrafo.split(/(?<=[.;:!?])\s+/)) {
    const candidato = actual.length > 0 ? `${actual} ${frase}` : frase;

    if (bytes(candidato) <= LIMITE_BYTES) {
      actual = candidato;
      continue;
    }

    if (actual.length > 0) {
      trozos.push(actual);
      actual = "";
    }

    // Una sola frase que ya se pasa de 500 bytes (openFDA tiene párrafos
    // interminables sin puntuación): no queda otra que cortarla por palabras.
    if (bytes(frase) > LIMITE_BYTES) {
      let parcial = "";
      for (const palabra of frase.split(" ")) {
        const conPalabra = parcial.length > 0 ? `${parcial} ${palabra}` : palabra;
        if (bytes(conPalabra) > LIMITE_BYTES) {
          if (parcial.length > 0) trozos.push(parcial);
          parcial = palabra;
        } else {
          parcial = conPalabra;
        }
      }
      if (parcial.length > 0) actual = parcial;
    } else {
      actual = frase;
    }
  }

  if (actual.length > 0) trozos.push(actual);
  return trozos;
}

export class MyMemoryTraductor implements Traductor {
  /**
   * @param email Sin él, MyMemory da 5.000 caracteres/día. Con un email válido
   *              en el parámetro `de`, sube a 50.000/día. No es una API key:
   *              es un contacto para que puedan avisarte si hay problemas.
   */
  constructor(private readonly email?: string) {}

  async traducir(textos: readonly string[], destino: Idioma): Promise<string[]> {
    const traducidos: string[] = [];
    // En serie, a propósito: MyMemory es un servicio gratuito con cuota diaria.
    // Lanzarle decenas de peticiones en paralelo es la forma más rápida de que
    // te corte el grifo.
    for (const texto of textos) {
      traducidos.push(await this.traducirUno(texto, destino));
    }
    return traducidos;
  }

  private async traducirUno(texto: string, destino: Idioma): Promise<string> {
    const parrafosTraducidos: string[] = [];

    for (const parrafo of texto.split("\n\n")) {
      const trozos = trocear(parrafo);
      const partes: string[] = [];
      for (const trozo of trozos) {
        partes.push(await this.pedir(trozo, destino));
      }
      parrafosTraducidos.push(partes.join(" "));
    }

    // Se recompone con la misma estructura de párrafos con la que entró.
    return parrafosTraducidos.join("\n\n");
  }

  private async pedir(texto: string, destino: Idioma): Promise<string> {
    const url = new URL(ENDPOINT);
    url.searchParams.set("q", texto);
    url.searchParams.set("langpair", `en|${destino}`);
    if (this.email) url.searchParams.set("de", this.email);

    const respuesta = await fetch(url, { cache: "no-store" });
    if (!respuesta.ok) {
      throw new Error(`MyMemory respondió ${respuesta.status} ${respuesta.statusText}`);
    }

    const datos = (await respuesta.json()) as RespuestaMyMemory;

    // Cuando se agota la cuota diaria, MyMemory NO devuelve un error HTTP:
    // responde 200 y mete el aviso dentro de `translatedText`. Si no lo
    // detectáramos, guardaríamos "YOU USED ALL AVAILABLE FREE TRANSLATIONS"
    // en la caché como si fuera la traducción buena. Lanzar aquí hace que el
    // caso de uso caiga con elegancia al texto en inglés.
    if (datos.quotaFinished) {
      throw new Error("Cuota diaria de MyMemory agotada.");
    }

    const traducido = datos.responseData?.translatedText;
    if (Number(datos.responseStatus) !== 200 || !traducido) {
      throw new Error(
        `MyMemory falló: ${datos.responseDetails || `estado ${datos.responseStatus}`}`,
      );
    }

    return traducido;
  }
}
