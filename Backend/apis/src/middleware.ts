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

  console.log("Middleware ejecutado para:", req.url);


  const origin = req.headers.get("origin") ?? "";
  console.log("Origin:", origin);
  const isAllowed = ALLOWED_ORIGINS.has(origin);

  // Si es preflight OPTIONS, responde aquí mismo
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      res.headers.set("Access-Control-Allow-Origin", origin);
    }
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Max-Age", "86400");
    return res;
  }

  // Para el resto de métodos, deja pasar y agrega headers
  const res = NextResponse.next();
  if (isAllowed) {
    console.log("Permitiendo origen:", origin);
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  res.headers.set("Vary", "Origin");
  return res;

}

export const config = {
  matcher: ["/api/:path*"],
};


