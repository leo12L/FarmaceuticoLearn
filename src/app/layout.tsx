import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Nav } from "./Nav";
import "./globals.css";

// Inter: pensada para interfaces y para texto denso en pantalla. Los prospectos
// son párrafos largos y con muchas cifras; la fuente del sistema los sostiene peor.
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "FarmaEdu",
  description: "Estudia medicamentos: fichas, principios activos y rondas de repaso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className}>
      <body className="min-h-screen">
        <Nav />

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

        <footer className="mt-8 border-t border-borde">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-ink-tenue sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-marca">FarmaEdu</p>
              <p className="mt-1">
                © 2024 FarmaEdu. Material de referencia académica. Datos de openFDA ·
                Traducción automática · No es consejo médico.
              </p>
            </div>
            <div className="flex gap-5">
              <span>Aviso Legal</span>
              <span>Privacidad</span>
              <span>Metodología</span>
              <span>Contacto</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
