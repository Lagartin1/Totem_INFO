import { NextResponse } from 'next/server';
// Ajusta la ruta para importar tu controlador
import { getTopClickedPracticas } from '@/controllers/practicas/practicasController'; 

/**
 * Manejador para GET /api/practicas/top-visitadas
 * Obtiene las prácticas más visitadas.
 */
export async function GET() {
  try {
    // Llama a la función que ya escribiste en tu controlador
    return await getTopClickedPracticas();

  } catch (error) {
    console.error("[TOP_PRACTICAS_GET] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { status: 500 }
    );
  }
}