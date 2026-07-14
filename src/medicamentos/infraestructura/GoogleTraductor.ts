import type { Idioma, Traductor } from "../domain/Traductor";

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

// Google admite peticiones grandes, pero no infinitas. Troceamos a un tamaño
// cómodo: hay campos de openFDA con más de 11.000 caracteres.
const MAXIMO_POR_TROZO = 4500;

interface RespuestaGoogle {
  data?: { translations?: Array<{ translatedText?: string }> };
  error?: { message?: string };
}

/**
 * Parte un texto largo en trozos de como mucho `MAXIMO_POR_TROZO` caracteres,
 * cortando SIEMPRE por un salto de párrafo. Cortar a lo bruto por número de
 * caracteres partiría frases por la mitad y la traducción saldría incoherente.
 */
function trocear(texto: string): string[] {
  if (texto.length <= MAXIMO_POR_TROZO) return [texto];

  const trozos: string[] = [];
  let actual = "";

  for (const parrafo of texto.split("\n\n")) {
    if (actual.length + parrafo.length + 2 > MAXIMO_POR_TROZO && actual.length > 0) {
      trozos.push(actual);
      actual = "";
    }

    // Un solo párrafo que ya se pasa de largo: no queda otra que partirlo duro.
    if (parrafo.length > MAXIMO_POR_TROZO) {
      for (let i = 0; i < parrafo.length; i += MAXIMO_POR_TROZO) {
        trozos.push(parrafo.slice(i, i + MAXIMO_POR_TROZO));
      }
      continue;
    }

    actual = actual.length > 0 ? `${actual}\n\n${parrafo}` : parrafo;
  }

  if (actual.length > 0) trozos.push(actual);
  return trozos;
}

export class GoogleTraductor implements Traductor {
  constructor(private readonly apiKey: string) {}

  async traducir(textos: readonly string[], destino: Idioma): Promise<string[]> {
    // Un texto por petición. Cada uno se trocea y se vuelve a coser aquí dentro,
    // así que de puertas afuera sigue siendo "un texto entra, un texto sale".
    return Promise.all(textos.map((texto) => this.traducirUno(texto, destino)));
  }

  private async traducirUno(texto: string, destino: Idioma): Promise<string> {
    const trozos = trocear(texto);

    const respuesta = await fetch(`${ENDPOINT}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `q` admite un array: los trozos van en una sola petición y Google
      // devuelve las traducciones en el mismo orden.
      body: JSON.stringify({ q: trozos, source: "en", target: destino, format: "text" }),
      cache: "no-store",
    });

    const datos = (await respuesta.json()) as RespuestaGoogle;

    if (!respuesta.ok) {
      throw new Error(
        `Google Translate respondió ${respuesta.status}: ${datos.error?.message ?? respuesta.statusText}`,
      );
    }

    const traducciones = datos.data?.translations ?? [];
    if (traducciones.length !== trozos.length) {
      throw new Error(
        `Google devolvió ${traducciones.length} traducciones para ${trozos.length} trozos.`,
      );
    }

    // Se recomponen en el mismo orden y con el mismo separador con el que se partieron.
    return traducciones.map((t) => t.translatedText ?? "").join("\n\n");
  }
}
