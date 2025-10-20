import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lista blanca de orígenes permitidos
const ALLOWED_ORIGINS = new Set([
  "",
  "http://localhost:3004",
  "http://localhost:9080",
  "http://127.0.0.1:9080",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);

export function middleware(req: NextRequest) {
  console.log("Middleware CORS activado para:", req.url);

  const origin = req.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.has(origin);
  console.log("Origen de la solicitud:", origin, "Permitido:", isAllowed? "Sí" : "No");

  // Si es preflight OPTIONS, responde aquí mismo
  if (req.method === 'OPTIONS') {
    if (!isAllowed) {
      return new NextResponse('CORS origin not allowed', { status: 403 });
    }

    // Reflejar exactamente lo que pide el navegador
    const reqHeaders =
      req.headers.get('access-control-request-headers') ?? '';

    const res = new NextResponse(null, { status: 204 });
    res.headers.set('Access-Control-Allow-Origin', origin || '*'); // si origin vacío, es same-origin; no hay credenciales
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', reqHeaders);
    res.headers.set('Access-Control-Max-Age', '86400');
    res.headers.set('Vary', 'Origin');
    return res;
  }
  // Para el resto de métodos, deja pasar y agrega headers
  const res = NextResponse.next();
  if (isAllowed) {
    console.log("Permitiendo origen:", origin);
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set("Vary", "Origin");
  }
  return res;

}

export const config = {
  matcher: ["/api/:path*"],
};


