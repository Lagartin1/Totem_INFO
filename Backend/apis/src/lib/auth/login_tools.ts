import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";

// 1. Convierte import.meta.url en ruta de archivo
const __filename = fileURLToPath(import.meta.url);

// 2. Obtén el directorio del archivo
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../config/.env");
dotenv.config({ path: envPath });

const ACCESS_TTL_SEC = 30 * 60; // 30 min
const ALG = 'HS256'; // algoritmo de firma, sha-256 HMAC


// traer el secreto y lo hashea con SHA-256
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
  return await jwtVerify(token, secret);
}

// establece una cookie segura, httpOnly, sameSite=lax
export async function setCookie(name: string, value: string, opts?: Partial<{
  maxAge: number; path: string; sameSite: 'lax'|'strict'|'none'; secure: boolean; httpOnly: boolean;
}>) {
  const jar = await cookies();

  jar.set({
    name,
    value,
    httpOnly: opts?.httpOnly ?? true,
    secure: opts?.secure ?? true,
    sameSite: opts?.sameSite ?? 'lax',
    path: opts?.path ?? '/',
    maxAge: opts?.maxAge ?? undefined
  });
}

// CSRF, cross-site request forgery, protección contra falsificación de petición en sitios cruzados
// emite un token aleatorio y lo guarda en una cookie
const CSRF_COOKIE = 'csrf_token';

export function issueCsrfToken() {
  return crypto.randomBytes(32).toString('base64url');
}


// verifica que el token enviado en el header coincida con el de la cookie
export async function requireCsrf(headerValue: string | null): Promise<boolean> {
  const jar = await cookies(); // ⬅️ await
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  return Boolean(cookieToken && headerValue && cookieToken === headerValue);
}