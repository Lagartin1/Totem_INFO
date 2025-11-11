// En app/api/practicas/top-visitadas/route.ts

import { NextRequest, NextResponse } from 'next/server';
// Importa AMBAS funciones del modelo
import { getTopPracticas, getTopPracticasByDateRange } from '@/models/practicas/practicasModel'; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let result;

    if (startDate && endDate) {
        // Si hay fechas, usa la nueva función de logs
        result = await getTopPracticasByDateRange(startDate, endDate);
    } else {
        // Si NO hay fechas, usa la función original (total histórico)
        result = await getTopPracticas(10); // Asumo que getTopPracticas está en el controlador
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("[TOP_PRACTICAS_GET] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { status: 500 }
    );
  }
}