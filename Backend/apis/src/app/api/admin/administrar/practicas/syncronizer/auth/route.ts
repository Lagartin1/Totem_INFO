import { NextRequest, NextResponse } from 'next/server';
import { getSyncronizerJwtSecret } from '@/lib/auth/login_tools';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

function createAccessCookie(token: string) {
  // Para comunicación interna entre contenedores (HTTP), no usar secure
  // Si fuera HTTPS interno, cambiar a true
  return {
    name: 'access_token',
    value: token,
    httpOnly: true,
    secure: false,  // HTTP interno entre contenedores
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  };
}

export async function POST(req: NextRequest) {
  const secret = getSyncronizerJwtSecret();
  if (!secret) return new Response('SYNCRONIZER_JWT_SECRET not set', { status: 500 });

  const { password } = await req.json().catch(() => ({} as any));
  if (!password) return new Response('Invalid data', { status: 400 });

  const isMatch = await bcrypt.compare(secret.toString(),password);

  if (!isMatch) return new Response('Invalid credentials', { status: 401 });

  // generar token de acceso
  const buf = crypto.getRandomValues(new Uint8Array(32));
  const accessToken = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');

  const jar = await cookies();
  jar.set(createAccessCookie(accessToken));
  // Devolver token en JSON para clientes no-browser que no reciben Set-Cookie
  return NextResponse.json({ ok: true, access_token: accessToken });
}
