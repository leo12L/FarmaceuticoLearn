import "server-only";

import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import type { CampoFicha } from "../domain/Ficha";
import { Ficha } from "../domain/Ficha";
import type { FichaMedicamento } from "../domain/FichaMedicamento";
import { Medicamento } from "../domain/Medicamento";
import type {
  CriteriosBusqueda,
  MedicamentoRepository,
} from "../domain/MedicamentoRepository";

// La forma cruda de la fila de MySQL. No sale de este archivo: se traduce a
// entidades del dominio antes de devolver nada.
interface FilaMedicamento extends RowDataPacket {
  id: number;
  openfda_set_id: string;
  nombre_marca: string | null;
  nombre_generico: string | null;
  principio_activo: string | null;
  fabricante: string | null;
}

interface FilaFicha extends FilaMedicamento {
  indicaciones: string | null;
  contraindicaciones: string | null;
  dosis: string | null;
  efectos_adversos: string | null;
  advertencias: string | null;
}

/**
 * Los nombres de openFDA se pasan de largo con facilidad (fabricantes con
 * razón social completa, listas de principios activos). MariaDB en modo
 * estricto rechaza la fila entera si un valor no cabe, así que recortamos
 * al ancho real de la columna. Es un detalle de persistencia: por eso vive
 * aquí y no en el dominio.
 */
function cabe(valor: string | null, maximo: number): string | null {
  if (valor === null) return null;
  return valor.length <= maximo ? valor : valor.slice(0, maximo);
}

export class MysqlMedicamentoRepository implements MedicamentoRepository {
  constructor(private readonly pool: Pool) {}

  async buscar({ texto, limite }: CriteriosBusqueda): Promise<Medicamento[]> {
    const condicion = texto
      ? `WHERE nombre_marca LIKE ? OR nombre_generico LIKE ? OR principio_activo LIKE ?`
      : "";

    // Los valores SIEMPRE van como parámetros (`?`), nunca interpolados en el
    // string: es lo que impide la inyección de SQL.
    const patron = `%${texto ?? ""}%`;
    const parametros = texto ? [patron, patron, patron, limite] : [limite];

    const [filas] = await this.pool.query<FilaMedicamento[]>(
      `SELECT id, openfda_set_id, nombre_marca, nombre_generico,
              principio_activo, fabricante
         FROM medicamento
         ${condicion}
        ORDER BY COALESCE(nombre_marca, nombre_generico)
        LIMIT ?`,
      parametros,
    );

    return filas.map(
      (fila) =>
        new Medicamento(
          fila.id,
          fila.openfda_set_id,
          fila.nombre_marca,
          fila.nombre_generico,
          fila.principio_activo,
          fila.fabricante,
        ),
    );
  }

  async obtenerFicha(id: number): Promise<Ficha | null> {
    const [filas] = await this.pool.query<FilaFicha[]>(
      `SELECT id, openfda_set_id, nombre_marca, nombre_generico, principio_activo,
              fabricante, indicaciones, contraindicaciones, dosis,
              efectos_adversos, advertencias
         FROM medicamento
        WHERE id = ?`,
      [id],
    );

    const fila = filas[0];
    if (!fila) return null;

    const medicamento = new Medicamento(
      fila.id,
      fila.openfda_set_id,
      fila.nombre_marca,
      fila.nombre_generico,
      fila.principio_activo,
      fila.fabricante,
    );

    // Las columnas NULL simplemente no entran: `camposPresentes()` los distingue
    // de un texto vacío, y así no traducimos ni mostramos huecos.
    const textos: Partial<Record<CampoFicha, string>> = {};
    if (fila.indicaciones) textos.indicaciones = fila.indicaciones;
    if (fila.dosis) textos.dosis = fila.dosis;
    if (fila.contraindicaciones) textos.contraindicaciones = fila.contraindicaciones;
    if (fila.efectos_adversos) textos.efectosAdversos = fila.efectos_adversos;
    if (fila.advertencias) textos.advertencias = fila.advertencias;

    return new Ficha(medicamento, textos);
  }

  async guardar(fichas: readonly FichaMedicamento[]): Promise<number> {
    if (fichas.length === 0) return 0;

    const valores = fichas.map((ficha) => [
      cabe(ficha.openFdaSetId, 64),
      cabe(ficha.nombreMarca, 255),
      cabe(ficha.nombreGenerico, 255),
      cabe(ficha.principioActivo, 500),
      cabe(ficha.fabricante, 255),
      ficha.indicaciones,
      ficha.contraindicaciones,
      ficha.dosis,
      ficha.efectosAdversos,
      ficha.advertencias,
    ]);

    // UPSERT sobre la clave única `openfda_set_id`: re-sincronizar el mismo
    // medicamento lo actualiza en vez de duplicarlo. `sincronizado_en` se
    // refresca para saber cuándo caducó la caché.
    // Nótese el `?` único: mysql2 expande el array de arrays en un solo INSERT
    // con N tuplas. Una ida y vuelta a la base, no una por ficha.
    const [resultado] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO medicamento
         (openfda_set_id, nombre_marca, nombre_generico, principio_activo,
          fabricante, indicaciones, contraindicaciones, dosis,
          efectos_adversos, advertencias)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         nombre_marca       = VALUES(nombre_marca),
         nombre_generico    = VALUES(nombre_generico),
         principio_activo   = VALUES(principio_activo),
         fabricante         = VALUES(fabricante),
         indicaciones       = VALUES(indicaciones),
         contraindicaciones = VALUES(contraindicaciones),
         dosis              = VALUES(dosis),
         efectos_adversos   = VALUES(efectos_adversos),
         advertencias       = VALUES(advertencias),
         sincronizado_en    = CURRENT_TIMESTAMP`,
      [valores],
    );

    // MySQL cuenta 2 por cada fila actualizada y 1 por cada insertada, así que
    // `affectedRows` no sirve como "cuántas guardé". Las fichas que llegaron
    // aquí se guardaron todas: o se insertaron, o se actualizaron.
    void resultado;
    return fichas.length;
  }
}
