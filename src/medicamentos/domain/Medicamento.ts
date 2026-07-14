// El núcleo. Este archivo no importa NADA: ni Next, ni mysql2, ni openFDA.
// Si algún día lo hace, la arquitectura se rompió.

export class Medicamento {
  constructor(
    readonly id: number,
    readonly openFdaSetId: string,
    readonly nombreMarca: string | null,
    readonly nombreGenerico: string | null,
    readonly principioActivo: string | null,
    readonly fabricante: string | null,
  ) {}

  // openFDA es irregular: hay etiquetas sin marca comercial y otras sin nombre
  // genérico. Decidir con cuál se muestra la card es una regla del dominio,
  // no algo que deba resolver cada componente de la UI por su cuenta.
  nombre(): string {
    return this.nombreMarca ?? this.nombreGenerico ?? "Medicamento sin nombre";
  }

  // El subtítulo solo se enseña si aporta algo distinto del título.
  subtitulo(): string | null {
    const otro = this.nombreMarca ? this.nombreGenerico : null;
    return otro && otro !== this.nombre() ? otro : null;
  }
}
