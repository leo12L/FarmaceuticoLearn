"use client";

// Página de cara al usuario: crear cuenta e iniciar sesión. NO es un panel de
// administración: nadie ve ni edita los datos de otros. Consume la API REST
// (POST /api/usuarios y POST /api/usuarios/login) desde el cliente.
//
// NOTA(auth): el login verifica las credenciales contra el servidor, pero
// todavía no abre una sesión (no hay cookie ni token). Establecer la sesión es
// el siguiente paso; ver el TODO(auth) en src/di/container.ts.

import { useState } from "react";

type Pestana = "registro" | "login";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  creadoEn: string;
}

export default function CuentaPage() {
  const [pestana, setPestana] = useState<Pestana>("registro");

  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tu cuenta</h1>
        <p className="text-sm text-ink-suave">
          Crea una cuenta o inicia sesión para guardar tus rondas de repaso.
        </p>
      </header>

      {/* Pestañas Registro / Login */}
      <div className="grid grid-cols-2 rounded-lg border border-borde bg-surface p-1 text-sm">
        <button
          onClick={() => setPestana("registro")}
          className={`rounded-md py-2 font-medium transition ${
            pestana === "registro" ? "bg-marca text-white" : "text-ink-suave hover:text-ink"
          }`}
        >
          Crear cuenta
        </button>
        <button
          onClick={() => setPestana("login")}
          className={`rounded-md py-2 font-medium transition ${
            pestana === "login" ? "bg-marca text-white" : "text-ink-suave hover:text-ink"
          }`}
        >
          Iniciar sesión
        </button>
      </div>

      {pestana === "registro" ? <Registro /> : <Login />}
    </div>
  );
}

// Lee el { error } del body cuando la respuesta no es OK.
async function mensajeDeError(res: Response): Promise<string> {
  try {
    const cuerpo = await res.json();
    return cuerpo?.error ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

const claseInput =
  "w-full rounded-lg border border-borde bg-transparent px-3 py-2 text-sm outline-none focus:border-marca";
const claseBoton =
  "w-full rounded-lg bg-marca px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password }),
      });
      if (!res.ok) throw new Error(await mensajeDeError(res));
      const usuario: Usuario = await res.json();
      setOk(`¡Cuenta creada, ${usuario.nombre}! Ya puedes iniciar sesión.`);
      setNombre("");
      setCorreo("");
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="space-y-3 rounded-tarjeta border border-borde bg-surface p-6 shadow-suave"
    >
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-suave">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className={claseInput}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-suave">Correo</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tu@correo.com"
          className={claseInput}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-suave">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className={claseInput}
          required
        />
      </div>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg border border-exito/30 bg-exito/5 px-3 py-2 text-sm text-exito">
          {ok}
        </p>
      )}

      <button type="submit" disabled={enviando} className={claseBoton}>
        {enviando ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setUsuario(null);
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      if (!res.ok) throw new Error(await mensajeDeError(res));
      setUsuario(await res.json());
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
    } finally {
      setEnviando(false);
    }
  }

  if (usuario) {
    return (
      <div className="space-y-3 rounded-tarjeta border border-borde bg-surface p-6 text-center shadow-suave">
        <p className="text-sm text-ink-suave">Sesión iniciada como</p>
        <p className="text-lg font-semibold">{usuario.nombre}</p>
        <p className="text-sm text-ink-suave">{usuario.correo}</p>
        <button onClick={() => setUsuario(null)} className="text-sm text-marca hover:underline">
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="space-y-3 rounded-tarjeta border border-borde bg-surface p-6 shadow-suave"
    >
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-suave">Correo</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="tu@correo.com"
          className={claseInput}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-suave">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          className={claseInput}
          required
        />
      </div>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <button type="submit" disabled={enviando} className={claseBoton}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
