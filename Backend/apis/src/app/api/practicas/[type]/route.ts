import { NextRequest,NextResponse } from "next/server";
import { fetchPracticas } from "@/controllers/practicas/practicasController";


export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const searchParams = _req.nextUrl.searchParams;
  const pagina = searchParams.get('pagina') || '1';
  const year = searchParams.get('year') || false;
  const indice = Number(pagina) > 1 ? (Number(pagina) - 1)*10: 0;
  
  try{
    let tipo_practica:any;
    if (type === "profesional") {
      tipo_practica = "Profesional";
    } else if (type === "inicial") {
      tipo_practica = "Inicial";
    } else {
      return NextResponse.json({ error: 'Tipo de práctica no válido' }, { status: 400 });
    }  
    return NextResponse.json(await fetchPracticas(year, indice, tipo_practica), { status: 200 });

  }catch(error){
    console.log(error)
    return NextResponse.json({ error: 'Error al obtener las prácticas' }, { status: 500 });
  }
  
}

export async function POST(req: Request) {
  const body = await req.json();
  // guardar body...
  return Response.json({ creado: body }, { status: 201 });
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