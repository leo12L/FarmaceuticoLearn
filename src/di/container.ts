import "server-only";

import { CrearRonda } from "@/juego/application/CrearRonda";
import { ObtenerRanking } from "@/juego/application/ObtenerRanking";
import { ObtenerRonda } from "@/juego/application/ObtenerRonda";
import { ResponderPregunta } from "@/juego/application/ResponderPregunta";
import { MysqlCatalogoJugable } from "@/juego/infraestructura/MysqlCatalogoJugable";
import { MysqlRanking } from "@/juego/infraestructura/MysqlRanking";
import { MysqlRondaRepository } from "@/juego/infraestructura/MysqlRondaRepository";
import { BuscarMedicamentos } from "@/medicamentos/application/BuscarMedicamentos";
import { ObtenerFichaMedicamento } from "@/medicamentos/application/ObtenerFichaMedicamento";
import { SincronizarMedicamentos } from "@/medicamentos/application/SincronizarMedicamentos";
import { MyMemoryTraductor } from "@/medicamentos/infraestructura/MyMemoryTraductor";
import { MysqlMedicamentoRepository } from "@/medicamentos/infraestructura/MysqlMedicamentoRepository";
import { MysqlTraduccionRepository } from "@/medicamentos/infraestructura/MysqlTraduccionRepository";
import { OpenFdaCatalogo } from "@/medicamentos/infraestructura/OpenFdaCatalogo";
import { pool } from "@/shared/infraestructura/mysql/pool";
import { CrearUsuario } from "@/usuarios/application/CrearUsuario";
import { IniciarSesion } from "@/usuarios/application/IniciarSesion";
import { MysqlUsuarioRepository } from "@/usuarios/infraestructura/MysqlUsuarioRepository";
import { ScryptHasher } from "@/usuarios/infraestructura/ScryptHasher";

// COMPOSITION ROOT. La única capa que sabe a la vez qué puertos existen y qué
// adapters los cumplen. Cambiar Google por LibreTranslate o DeepL es cambiar
// la línea del `traductor`: ni el dominio ni los casos de uso se enteran.
const medicamentoRepository = new MysqlMedicamentoRepository(pool);
const traduccionRepository = new MysqlTraduccionRepository(pool);
const catalogoExterno = new OpenFdaCatalogo(process.env.OPENFDA_API_KEY);
const traductor = new MyMemoryTraductor(process.env.MYMEMORY_EMAIL);

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

// --- Juego ---
const rondaRepository = new MysqlRondaRepository(pool);
const catalogoJugable = new MysqlCatalogoJugable(pool);

export const crearRonda = new CrearRonda(catalogoJugable, rondaRepository);
export const obtenerRonda = new ObtenerRonda(rondaRepository);
export const responderPregunta = new ResponderPregunta(rondaRepository);
export const obtenerRanking = new ObtenerRanking(new MysqlRanking(pool));

// --- Usuarios (registro + login) ---
const usuarioRepository = new MysqlUsuarioRepository(pool);
const hasher = new ScryptHasher();

export const crearUsuario = new CrearUsuario(usuarioRepository, hasher);
export const iniciarSesion = new IniciarSesion(usuarioRepository, hasher);

/**
 * TODO(auth): mientras no haya login, todas las rondas son de este usuario.
 * Cuando exista sesión, esto sale de la cookie y no cambia nada más:
 * los casos de uso ya reciben el usuarioId como argumento.
 */
export const USUARIO_DEMO_ID = 1;
