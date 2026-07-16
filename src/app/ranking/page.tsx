import { obtenerRanking } from "@/di/container";

export const metadata = {
  title: "Ranking · FarmaEdu",
};

// Acento del podio para los tres primeros: oro, plata, bronce.
const PODIO = ["text-oro", "text-ink-tenue", "text-[#c08457]"];

export default async function RankingPage() {
  const ranking = await obtenerRanking.run(50);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-marca sm:text-4xl">Ranking</h1>
        <p className="text-sm text-ink-suave">
          Clasificación semanal por puntos totales. Cada ronda terminada suma a tu marca.
        </p>
      </header>

      {ranking.length === 0 ? (
        <div className="rounded-tarjeta border border-dashed border-borde-fuerte p-12 text-center">
          <p className="text-sm text-ink-suave">Todavía no hay partidas terminadas.</p>
          <p className="mt-1 text-sm text-ink-tenue">
            Juega una ronda para aparecer en el ranking.
          </p>
        </div>
      ) : (
        <ol className="overflow-hidden rounded-tarjeta border border-borde bg-surface shadow-suave">
          {ranking.map((e, i) => {
            const posicion = i + 1;
            const esPodio = posicion <= 3;
            return (
              <li
                key={e.usuarioId}
                className={`flex items-center gap-4 border-b border-borde px-5 py-4 last:border-b-0 ${
                  esPodio ? "bg-marca-tenue/40" : ""
                }`}
              >
                <span
                  className={`tabular grid w-8 shrink-0 place-items-center text-lg font-bold ${
                    esPodio ? PODIO[i] : "text-ink-tenue"
                  }`}
                >
                  {posicion}
                </span>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-marca text-sm font-semibold text-white">
                  {e.nombre.slice(0, 1).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{e.nombre}</p>
                  <p className="tabular text-xs text-ink-tenue">
                    {e.rondasJugadas} {e.rondasJugadas === 1 ? "ronda" : "rondas"}
                  </p>
                </div>

                <span className="tabular shrink-0 text-right">
                  <span className="text-lg font-bold text-marca">
                    {e.puntosTotales.toLocaleString("es")}
                  </span>
                  <span className="ml-1 text-xs text-ink-tenue">pts</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
