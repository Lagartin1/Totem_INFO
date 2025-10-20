import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginService, refreshService, logoutService } from '@/services/admin/authService';
// import { requireCsrf } from '@/lib/auth/login_tools'; // si lo activas después

const ACCESS_COOKIE  = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const isProd = process.env.NODE_ENV === 'production';
const ACCESS_TTL_SEC  = Number(process.env.ACCESS_TTL_SEC  ?? 30 * 60);
const REFRESH_TTL_SEC = Number(process.env.REFRESH_TTL_SEC ?? 24 * 60 * 60);

// Helpers para cookies
async function setAccessCookie(token: string) {
  const jar = await cookies();
  jar.set({
    name: ACCESS_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TTL_SEC,
  });
}

async function setRefreshCookie(token: string) {
  const jar = await cookies();
  jar.set({
    name: REFRESH_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: REFRESH_TTL_SEC,
  });
}

async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

// ============================
// LOGIN
// ============================
export async function loginController(req: Request) {
  try {
    const { username, password } = await req.json().catch(() => ({} as any));
    if (!username || !password) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    console.log("IDENTIFICADOR:",username);
    console.log("PASSWORD:",password);
    const data = await loginService(username, password);
    if (!data) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    await setAccessCookie(data.accessToken);
    await setRefreshCookie(data.refreshToken);

     return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          nombre: data.user.nombre,
          apellido: data.user.apellido,
          expiresAt: data.refreshExpiresAt, // fecha de expiración del refresh
        },
      },
    });
  } catch (e) {
    console.error('loginController error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ============================
// REFRESH
// ============================
export async function refreshController() {
  try {
    const jar = await cookies();
    const old = jar.get(REFRESH_COOKIE)?.value;
    if (!old) return NextResponse.json({ error: 'Sin refresh token' }, { status: 401 });

    const data = await refreshService(old);
    if (!data) return NextResponse.json({ error: 'Refresh inválido' }, { status: 401 });

    await setAccessCookie(data.accessToken);
    await setRefreshCookie(data.refreshToken);

    return NextResponse.json({ exp: data.refreshExpiresAt });
  } catch (e) {
    console.error('refreshController error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ============================
// LOGOUT
// ============================
export async function logoutController() {
  try {
    const jar = await cookies();
    const old = jar.get(REFRESH_COOKIE)?.value;
    if (old) await logoutService(old);

    await clearAuthCookies();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('logoutController error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
