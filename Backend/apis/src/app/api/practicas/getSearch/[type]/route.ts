import { NextRequest, NextResponse } from "next/server";
import {SearchTermPracticas} from "@/controllers/practicas/practicasController";

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params; // aquí tendrás "profesional"
  try{
    const { searchParams } = new URL(req.url);
    const term = searchParams.get('q') || '';
    if (!term) {
      return NextResponse.json({ error: "Falta el parámetro 'q'" }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ error: "Falta el parámetro 'type'" }, { status: 400 });
    }
    let tipo_practica:any;
    if (type === "profesional") {
      tipo_practica = "Profesional";
    } else if (type === "inicial") {
      tipo_practica = "Inicial";
    } else {
      return NextResponse.json({ error: 'Tipo de práctica no válido' }, { status: 400 });
    } 
    
    const practicasData = await SearchTermPracticas(term, tipo_practica);
    return NextResponse.json(practicasData, { status: 200 });

  }
  catch(error){
    console.error(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
