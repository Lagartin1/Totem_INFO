import { NextRequest, NextResponse } from "next/server";
import { fetchPracticas } from "@/controllers/practicas/practicasController";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserIdFromSessionToken } from "@/lib/auth/login_tools";

// 1. Fíjate que ahora 'params' está envuelto en Promise<...>
export async function GET(_req: NextRequest,{ params }: { params: Promise<{ type: string }> } ) {
  // 2. Tienes que hacer 'await' antes de usarlo
  const { type } = await params; 

  const searchParams = _req.nextUrl.searchParams;
  const pagina = searchParams.get('pagina') || '1';
  const year = searchParams.get('year') || false;
  const PAGE_SIZE = 6; // Coincide con el frontend
  const indice = Number(pagina) > 1 ? (Number(pagina) - 1) * PAGE_SIZE : 0;
  
  try {
    let tipo_practica: any;
    
    // El resto de tu lógica sigue igual...
    if (type === "profesional") {
      tipo_practica = "Profesional";
    } else if (type === "inicial") {
      tipo_practica = "Inicial";
    } else {
      return NextResponse.json({ error: 'Tipo de práctica no válido' }, { status: 400 });
    }  
    return NextResponse.json(await fetchPracticas(year, indice, tipo_practica, null), { status: 200 });

  } catch(error) {
    console.log(error)
    return NextResponse.json({ error: 'Error al obtener las prácticas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // El middleware ya verificó el access_token
    const jar = await cookies();
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 3. Procesar la solicitud
    const body = await req.json();
    // TODO: Implementar lógica de guardado
    return NextResponse.json({ creado: body }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /practicas/[type]:", error);
    return NextResponse.json(
      { error: "Error al crear la práctica" },
      { status: 500 }
    );
  }
}



export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5173", // o *
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400", // cachea la preflight 24h
    },
  });
}