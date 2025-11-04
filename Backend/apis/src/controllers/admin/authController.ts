import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setCookie, deleteCookie} from '@/lib/auth/login_tools';
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
export async function refreshController(req: NextRequest) {
  try {
    // 1) leer refresh actual desde cookie httpOnly
    const jar = await cookies();
    const oldRefresh = jar.get(REFRESH_COOKIE)?.value;
    if (!oldRefresh) {
      return NextResponse.json({ error: 'Sin refresh token' }, { status: 401 });
    }
    console.log("OLD REFRESH TOKEN:",oldRefresh); // --- IGNORE ---
    // 2) rotar sesión (genera nuevo refresh + nuevo access)
    const data = await refreshService(oldRefresh);
    if (!data) {
      // Invalida cookies si el refresh es inválido/expirado/revocado
      await deleteCookie(ACCESS_COOKIE);
      await deleteCookie(REFRESH_COOKIE);
      return NextResponse.json({ error: 'Refresh inválido' }, { status: 401 });
    }

    // 3) setear cookies usando login_tools.setCookie
    await setCookie(ACCESS_COOKIE, data.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TTL_SEC,
    });

    await setCookie(REFRESH_COOKIE, data.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',  // si algún día usas subdominios, quizá 'lax'/'none'
      path: '/',
      maxAge: REFRESH_TTL_SEC,
    });

    // 4) respuesta
    return NextResponse.json({
      ok: true,
      refresh_expires_at: data.refreshExpiresAt,
    });

  } catch (err) {
    console.error('refreshController error:', err);
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
