// En: src/app/api/practicas/detalle/[id]/route.ts

import { getPracticaDetails } from "@/controllers/practicas/practicasController";
import { NextRequest, NextResponse } from "next/server";

//                                                          👇 1. AÑADE 'Promise<...>'
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    //                                  👇 2. AÑADE 'await'
    const { id } = await params;
    
    // 3. Llama a la función del controlador
    return await getPracticaDetails(id);

  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Error interno del servidor" }), 
      { status: 500 }
    );
  }
}