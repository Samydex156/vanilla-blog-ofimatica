/**
 * MecaSamType Web — Configuración
 *
 * 1. Crea el proyecto en Supabase.
 * 2. Ejecuta sql/setup.sql en el SQL Editor.
 * 3. Project Settings → API → «Exposed schemas» → añade `mecanografia`.
 * 4. Copia aquí la Project URL y la anon public key (Settings → API).
 *
 * La anon key es pública por diseño: la seguridad la dan las funciones
 * SECURITY DEFINER y los tokens de sesión del esquema mecanografia.
 * NUNCA pongas aquí la service_role key.
 */

export const SUPABASE_URL = "https://ehscdeiexsedaslxoezw.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_KwRPMBm3r42HngFuQl1tuw_8X4sjzlE";

/** Esquema de Postgres donde viven las tablas del módulo. */
export const DB_SCHEMA = "mecanografia";

/** Duración del sprint competitivo, en segundos. */
export const SPRINT_SECONDS = 60;

export const IS_CONFIGURED =
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL.trim()) &&
  SUPABASE_ANON_KEY.trim().length > 30;

export function normalizeUsername(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function validateUsername(value) {
  return /^[a-z0-9._-]{3,24}$/.test(normalizeUsername(value));
}

export function validatePassword(value) {
  return String(value ?? "").length >= 8;
}
