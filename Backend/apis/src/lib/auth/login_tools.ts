import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from 'bcrypt';
import { createSessionInDB, findActiveSessions, revokeSessionInDB, rotateSessionInDB } from '@/models/admin/authModel';

// 1. Convierte import.meta.url en ruta de archivo
const __filename = fileURLToPath(import.meta.url);

// 2. Obtén el directorio del archivo
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../config/.env");
dotenv.config({ path: envPath });

const ACCESS_TTL_SEC = 30 * 60; // 30 min
const ALG = 'HS256'; // algoritmo de firma, sha-256 HMAC
const REFRESH_TTL_SEC = 24 * 60 * 60; // 24 horas

// JWT Secret
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Falta JWT_SECRET');
  return new TextEncoder().encode(secret);
}

// firma el token con el payload (datos del usuario)
export async function signAccessToken(payload: Record<string, any>) {
  const secret = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(secret);
}

// verifica el token del cliente con el secreto
export async function verifyAccessToken(token: string) {
  const secret = getJwtSecret();
  const res = await jwtVerify(token, secret);
  if (!res) {
    throw new Error('Token inválido');
  }
  return true;
}

// establece una cookie segura, httpOnly, sameSite=lax
export async function setCookie(name: string, value: string, opts?: Partial<{
  maxAge: number; path: string; sameSite: 'lax'|'strict'|'none'; secure: boolean; httpOnly: boolean;
}>) {
  const jar = await cookies();
  const isProd = process.env.NODE_ENV === 'production';
  
  jar.set({
    name,
    value,
    httpOnly: opts?.httpOnly ?? true,
    secure: opts?.secure ?? !isProd, // En desarrollo también true para sameSite=none
    sameSite: opts?.sameSite ?? 'none',
    path: opts?.path ?? '/',
    maxAge: opts?.maxAge ?? undefined
  });
}

export async function deleteCookie(name: string) {
  const jar = await cookies();
  jar.delete(name);
}

// CSRF, cross-site request forgery, protección contra falsificación de petición en sitios cruzados
// emite un token aleatorio y lo guarda en una cookie

// CSRF - Double Submit Cookie pattern
const CSRF_COOKIE_HTTPONLY = 'x-csrf-token';      // Cookie HttpOnly
const CSRF_COOKIE_PUBLIC = 'XSRF-TOKEN';          // Cookie pública (estándar)

export function issueCsrfToken() {
  return crypto.randomBytes(32).toString('base64url');
}

// Nueva función: guarda el token en AMBAS cookies
export async function setCsrfCookies(token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const jar = await cookies();
  
  // Cookie HttpOnly (para validación del servidor)
  jar.set({
    name: CSRF_COOKIE_HTTPONLY,
    value: token,
    httpOnly: true,
    secure: !isProd, // true en desarrollo para sameSite=none
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 15, // 15 minutos
  });
  
  // Cookie pública (para que JavaScript la lea)
  jar.set({
    name: CSRF_COOKIE_PUBLIC,
    value: token,
    httpOnly: false, // ← SIN HttpOnly
    secure: !isProd, // true en desarrollo para sameSite=none
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 15,
  });
  return jar;
}

// Verifica que el token del header coincida con la cookie HttpOnly
export async function requireCsrf(headerValue: string | null): Promise<boolean> {
  const jar = await cookies();
  const cookieToken = jar.get(CSRF_COOKIE_HTTPONLY)?.value;
  
  if (!cookieToken || !headerValue) {
    console.log('CSRF validation failed: missing token');
    return false;
  }
  
  if (cookieToken !== headerValue) {
    console.log('CSRF validation failed: tokens do not match');
    return false;
  }
  
  return true;
}

function newOpaqueToken() {
  return crypto.randomBytes(32).toString('base64url');
}
function refreshExpiryDate(from = new Date()) {
  return new Date(from.getTime() + REFRESH_TTL_SEC * 1000);
}
// Main functions
export async function createRefreshSession(userId: string, meta?: { ip?: string; ua?: string }) {
  const token     = newOpaqueToken();
  const tokenHash = await bcrypt.hash(token, 12);
  const expiresAt = refreshExpiryDate();

  const session = await createSessionInDB(userId, tokenHash, expiresAt, meta);
  if (!session) {
    throw new Error('No se pudo crear la sesión de refresh');
  }

  return { refreshToken: token, expiresAt };
}

/**
 * Verifica un refresh, lo rota y devuelve nuevo refresh + nuevo access.
 * Devuelve null si no existe/expiró/está revocado.
 */

export async function verifyAndRotateRefresh(
  oldToken: string,
  accessPayload?: Record<string, any>,
  meta?: { ip?: string; ua?: string }
) {
  // Ideal: que findActiveSessions ya filtre por no revocadas y no expiradas
  const candidates = await findActiveSessions();
  let match: (typeof candidates)[number] | null = null;

  for (const s of candidates) {
    // ✅ compara token plano vs hash almacenado
    if (await bcrypt.compare(oldToken, s.sessionIdHash)) {
      // (Opcional) validación de expiración defensiva si el filtro no la hace:
      if (s.expiresAt && new Date(s.expiresAt).getTime() <= Date.now()) {
        continue; // expiró → no es válida
      }
      match = s;
      break;
    }
  }
  if (!match) {
    console.log('No matching session found');
    return null;
  }
    

  // Rota refresh
  const newToken     = newOpaqueToken();
  const newHash      = await bcrypt.hash(newToken, 12);
  const newExpiresAt = refreshExpiryDate();

  console.log('new hash:', newHash); // --- IGNORE ---

  await rotateSessionInDB(match.id, match.userId, newHash, newExpiresAt, meta);

  // Access nuevo (incluye payload si lo pasas)
  const accessToken = await signAccessToken(accessPayload ?? { sub: match.userId });

  return { accessToken, refreshToken: newToken, refreshExpiresAt: newExpiresAt };
}



/** Revoca sesión por token (logout). */
export async function revokeRefreshByToken(token: string) {
  const candidates = await findActiveSessions();

  for (const s of candidates) {
    if (await bcrypt.compare(token, s.sessionIdHash)) {
      await revokeSessionInDB(s.id);
      return true;
    }
  }
  return false;
}



export async function getUserIdFromSessionToken(oldToken: string): Promise<string | null> {
  const candidates = await findActiveSessions();
  for (const s of candidates) {
    if (await bcrypt.compare(oldToken, s.sessionIdHash)) {
      if (s.expiresAt && new Date(s.expiresAt).getTime() <= Date.now()) {
        return null; // expiró
      }
      return s.userId ?? null; // no expiró -> devuelve userId
    }
  }
  return null;
}


export function getSyncronizerJwtSecret() {
  const secret = process.env.SYNCRONIZER_JWT_SECRET;
  if (!secret) throw new Error('Falta SYNCRONIZER_JWT_SECRET');
  return secret ;
}