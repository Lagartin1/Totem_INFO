import { getTopClickedPracticas } from "@/controllers/practicas/practicasController";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    
    // -----------------------------------------------------------------
    //  ⚠️ IMPORTANTE: ¡AQUÍ VA TU SEGURIDAD! ⚠️
    //
    //  Antes de llamar al controlador, debes verificar el token
    //  del administrador (Middleware o en esta misma ruta).
    //
    //  const admin = await verificarTokenDeAdmin(request);
    //  if (!admin) {
    //    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    //  }
    // -----------------------------------------------------------------


    // Si el token es válido, llama a la función del controlador que ya creaste
    return await getTopClickedPracticas();

  } catch (error) {
    console.error("Error al obtener tendencias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}