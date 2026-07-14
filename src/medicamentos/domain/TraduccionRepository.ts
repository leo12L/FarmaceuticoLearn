import type { CampoFicha, TextosFicha } from "./Ficha";
import type { Idioma } from "./Traductor";

// PUERTO de la caché de traducciones. Existe por dinero: traducir es caro y
// determinista (el mismo texto da siempre la misma salida), así que se paga
// una vez y se guarda.
//
// Es por CAMPO, no por ficha entera: si la traducción de un campo falla o se
// corta a mitad, lo ya traducido no se pierde y el reintento es parcial.

export interface TraduccionRepository {
  obtener(medicamentoId: number, idioma: Idioma): Promise<TextosFicha>;

  guardar(
    medicamentoId: number,
    idioma: Idioma,
    traducciones: ReadonlyArray<{ campo: CampoFicha; texto: string }>,
  ): Promise<void>;
}
