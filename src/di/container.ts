import "server-only";

import { BuscarMedicamentos } from "@/medicamentos/application/BuscarMedicamentos";
import { ObtenerFichaMedicamento } from "@/medicamentos/application/ObtenerFichaMedicamento";
import { SincronizarMedicamentos } from "@/medicamentos/application/SincronizarMedicamentos";
import { GoogleTraductor } from "@/medicamentos/infraestructura/GoogleTraductor";
import { MysqlMedicamentoRepository } from "@/medicamentos/infraestructura/MysqlMedicamentoRepository";
import { MysqlTraduccionRepository } from "@/medicamentos/infraestructura/MysqlTraduccionRepository";
import { OpenFdaCatalogo } from "@/medicamentos/infraestructura/OpenFdaCatalogo";
import { pool } from "@/shared/infraestructura/mysql/pool";

// COMPOSITION ROOT. La única capa que sabe a la vez qué puertos existen y qué
// adapters los cumplen. Cambiar Google por LibreTranslate o DeepL es cambiar
// la línea del `traductor`: ni el dominio ni los casos de uso se enteran.
const medicamentoRepository = new MysqlMedicamentoRepository(pool);
const traduccionRepository = new MysqlTraduccionRepository(pool);
const catalogoExterno = new OpenFdaCatalogo(process.env.OPENFDA_API_KEY);
const traductor = new GoogleTraductor(process.env.GOOGLE_TRANSLATE_API_KEY ?? "");

export const buscarMedicamentos = new BuscarMedicamentos(medicamentoRepository);

export const sincronizarMedicamentos = new SincronizarMedicamentos(
  catalogoExterno,
  medicamentoRepository,
);

export const obtenerFichaMedicamento = new ObtenerFichaMedicamento(
  medicamentoRepository,
  traduccionRepository,
  traductor,
);
