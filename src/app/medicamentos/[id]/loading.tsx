// La PRIMERA visita a una ficha llama al traductor y puede tardar decenas de
// segundos (el prospecto se trocea y se traduce por partes). Sin esto, la
// pantalla se queda en blanco y parece que la app se ha colgado.
// Next envuelve la página en un <Suspense> con esto de fallback.
export default function Cargando() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="h-4 w-20 animate-pulse rounded bg-borde" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-borde" />
        <div className="h-20 animate-pulse rounded-tarjeta bg-borde" />
      </header>

      <p className="text-sm text-ink-tenue">
        Traduciendo la ficha… la primera vez tarda unos segundos; después queda
        guardada.
      </p>

      <div className="space-y-8">
        {[0, 1, 2].map((i) => (
          <section key={i} className="space-y-3 border-l-2 border-borde pl-5">
            <div className="h-3 w-32 animate-pulse rounded bg-borde" />
            <div className="max-w-prose space-y-2">
              <div className="h-3 animate-pulse rounded bg-borde" />
              <div className="h-3 animate-pulse rounded bg-borde" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-borde" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
