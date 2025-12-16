import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/login_tools";
import { cookies } from "next/headers";


// Lista blanca de orígenes permitidos
const ALLOWED_ORIGINS = new Set([
  "",
  "http://localhost:3004",
  "http://localhost:9080",
  "http://127.0.0.1:9080",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://0.0.0.0:4004",
  "https://totem.inf.uach.cl",
]);

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = new Set([
  "/api/health",
  "/api/admin/auth/login",
  "/api/admin/auth/register",
  "/api/admin/auth/logout",
  "/api/noticias",
]);

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  // Excluir rutas explícitas y cualquier ruta relacionada con el sincronizador
  if (PUBLIC_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/api/admin/auth/")) return true;
  if (pathname.includes('/syncronizer')) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  console.log("Middleware activado para:", req.url);

  const origin = req.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.has(origin);
  console.log("Origen de la solicitud:", origin, "Permitido:", isAllowed? "Sí" : "No");

  // Si es preflight OPTIONS, responde aquí mismo
  if (req.method === 'OPTIONS') {
    const reqHeaders = req.headers.get('access-control-request-headers') ?? '';
    console.log('Preflight request headers:', reqHeaders);

    const allowHeaders = reqHeaders && reqHeaders.length > 0
      ? reqHeaders
      : 'Content-Type, X-CSRF-Token, Authorization, X-Requested-With';

    const res = new NextResponse(null, { status: 204 });
    // Nunca devolver '*' cuando se usan credenciales. Usar el origin explícito.
    res.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : '*');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', allowHeaders);
    res.headers.set('Access-Control-Max-Age', '86400');
    res.headers.set('Vary', 'Origin');
    return res;
  }

  // Verificación de autenticación para métodos POST, PUT, DELETE
  const pathname = req.nextUrl.pathname;
  const requiresAuth = ['POST', 'PUT', 'DELETE'].includes(req.method);
  
  if (requiresAuth && !isPublicRoute(pathname)) {
    const jar = await cookies();
    const accessToken = jar.get("access_token")?.value;
    if (!accessToken) {
      console.log('No access token found for:', pathname);
      const res401 = NextResponse.json({ ok: false }, { status: 401 });
      res401.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : '*');
      res401.headers.set('Access-Control-Allow-Credentials', 'true');
      res401.headers.set('Vary', 'Origin');
      return res401;
    }

    try {
      await verifyAccessToken(accessToken);
      console.log('Access token verified for:', pathname);
    } catch (error) {
      console.log('Invalid access token for:', pathname, error);
      const res401 = NextResponse.json({ error: 'Unauthorized - Invalid access token' }, { status: 401 });
      res401.headers.set('Access-Control-Allow-Origin', isAllowed ? origin : '*');
      res401.headers.set('Access-Control-Allow-Credentials', 'true');
      res401.headers.set('Vary', 'Origin');
      return res401;
    }
  }

  // Para el resto de métodos, deja pasar y agrega headers CORS
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", isAllowed ? origin : '*');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set("Vary", "Origin");
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
  runtime: 'nodejs',
};


