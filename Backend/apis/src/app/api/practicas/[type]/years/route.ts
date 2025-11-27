import { NextRequest, NextResponse } from "next/server";
import { fetchYearsPracticas } from "@/controllers/practicas/practicasController";

// 1. Fíjate que ahora 'params' está envuelto en Promise<...>
export async function GET(_req: NextRequest,{ params }: { params: Promise<{ type: string }> } ) {
  // 2. Tienes que hacer 'await' antes de usarlo
  const { type } = await params; 

  const searchParams = _req.nextUrl.searchParams;
  
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
    return NextResponse.json(await fetchYearsPracticas(tipo_practica), { status: 200 });

  } catch(error) {
    console.log(error)
    return NextResponse.json({ error: 'Error al obtener los años de prácticas' }, { status: 500 });
  }
}