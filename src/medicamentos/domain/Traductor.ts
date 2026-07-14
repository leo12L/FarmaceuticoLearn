export type Idioma = "es" | "en";

// PUERTO. El dominio dice "necesito traducir estos textos". Que detrás haya
// Google, LibreTranslate o DeepL es un detalle de infraestructura: cambiar de
// proveedor es escribir otro adapter y tocar una línea del container.

export interface Traductor {
  /** Traduce los textos en bloque. Devuelve las traducciones EN EL MISMO ORDEN. */
  traducir(textos: readonly string[], destino: Idioma): Promise<string[]>;
}
