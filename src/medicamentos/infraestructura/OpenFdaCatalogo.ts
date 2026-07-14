import type { CatalogoExterno } from "../domain/CatalogoExterno";
import { FichaMedicamento } from "../domain/FichaMedicamento";

const ENDPOINT = "https://api.fda.gov/drug/label.json";

// La forma CRUDA de openFDA. Todo es opcional y todo son arrays de strings:
// así es su API, y ese caos no debe salir de este archivo.
// Ojo: las etiquetas OTC (venta libre) no traen `contraindications` ni
// `adverse_reactions` —esos campos solo existen en las de prescripción—,
// por eso aquí está absolutamente todo marcado como opcional.
interface EtiquetaOpenFda {
  set_id?: string;
  indications_and_usage?: string[];
  contraindications?: string[];
  dosage_and_administration?: string[];
  adverse_reactions?: string[];
  // Las etiquetas OTC ponen las advertencias en `warnings`; las de prescripción,
  // en `warnings_and_cautions`. Hay que mirar los dos o se pierde la mitad.
  warnings?: string[];
  warnings_and_cautions?: string[];
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    substance_name?: string[];
    manufacturer_name?: string[];
  };
}

interface RespuestaOpenFda {
  results?: EtiquetaOpenFda[];
}

/** openFDA devuelve arrays de párrafos; los unimos en un texto único. */
function texto(valor: string[] | undefined): string | null {
  const unido = valor?.join("\n\n").trim();
  return unido ? unido : null;
}

/** Y arrays de nombres, donde nos vale el primero (o todos, para el principio activo). */
function primero(valor: string[] | undefined): string | null {
  return valor?.[0]?.trim() || null;
}

export class OpenFdaCatalogo implements CatalogoExterno {
  constructor(private readonly apiKey?: string) {}

  async descargar(termino: string, limite: number): Promise<FichaMedicamento[]> {
    const url = new URL(ENDPOINT);
    // Las comillas obligan a openFDA a buscar la frase completa. Escapamos las
    // comillas del término para que no pueda romper la query.
    const seguro = termino.replace(/"/g, "");
    url.searchParams.set(
      "search",
      `openfda.brand_name:"${seguro}" OR openfda.generic_name:"${seguro}" OR openfda.substance_name:"${seguro}"`,
    );
    url.searchParams.set("limit", String(limite));
    if (this.apiKey) {
      url.searchParams.set("api_key", this.apiKey);
    }

    const respuesta = await fetch(url, { cache: "no-store" });

    // openFDA responde 404 cuando la búsqueda no encuentra nada. No es un fallo:
    // es "no hay resultados". Tratarlo como error rompería la sincronización.
    if (respuesta.status === 404) {
      return [];
    }
    if (!respuesta.ok) {
      throw new Error(`openFDA respondió ${respuesta.status} ${respuesta.statusText}`);
    }

    const datos = (await respuesta.json()) as RespuestaOpenFda;

    return (datos.results ?? [])
      .filter((etiqueta): etiqueta is EtiquetaOpenFda & { set_id: string } =>
        Boolean(etiqueta.set_id),
      )
      .map((etiqueta) => this.aDominio(etiqueta));
  }

  // EL MAPPER: de la forma de openFDA a la nuestra. A partir de aquí,
  // el resto del sistema ya no sabe que openFDA existe.
  private aDominio(etiqueta: EtiquetaOpenFda & { set_id: string }): FichaMedicamento {
    const openfda = etiqueta.openfda ?? {};

    return new FichaMedicamento(
      etiqueta.set_id,
      primero(openfda.brand_name),
      primero(openfda.generic_name),
      openfda.substance_name?.join(", ").trim() || null,
      primero(openfda.manufacturer_name),
      texto(etiqueta.indications_and_usage),
      texto(etiqueta.contraindications),
      texto(etiqueta.dosage_and_administration),
      texto(etiqueta.adverse_reactions),
      texto(etiqueta.warnings) ?? texto(etiqueta.warnings_and_cautions),
    );
  }
}
