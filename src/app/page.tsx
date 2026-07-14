import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">FarmaceuticoLearn</h1>
        <p className="max-w-prose opacity-70">
          Consulta fichas de medicamentos y ponte a prueba con rondas de repaso.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/medicamentos"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Ver el catálogo
        </Link>
      </div>
    </section>
  );
}
