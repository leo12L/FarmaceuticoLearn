// El núcleo. Como en `Medicamento`, este archivo no importa NADA.
//
// Ojo con lo que NO está aquí: `password_hash`. El hash es un detalle de
// persistencia y de seguridad; no forma parte de la identidad del usuario que
// el resto de la app maneja. Al dejarlo fuera de la entidad, es imposible
// filtrarlo por accidente en una respuesta JSON: el dominio ni lo conoce.
export class Usuario {
  constructor(
    readonly id: number,
    readonly nombre: string,
    readonly correo: string,
    readonly creadoEn: Date,
  ) {}

  // La forma segura de mandar el usuario al exterior (respuesta HTTP, etc.).
  // Un único sitio que decide qué campos salen, en vez de repetir el objeto
  // literal en cada route handler.
  aJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      correo: this.correo,
      creadoEn: this.creadoEn.toISOString(),
    };
  }
}
