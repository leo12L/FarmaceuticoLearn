import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "FarmaceuticoLearn",
  description: "Estudia medicamentos: fichas, principios activos y rondas de repaso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-black/10 dark:border-white/15">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
            <Link href="/" className="font-semibold">
              FarmaceuticoLearn
            </Link>
            <Link href="/medicamentos" className="text-sm opacity-70 hover:opacity-100">
              Catálogo
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
