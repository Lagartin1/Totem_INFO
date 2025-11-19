import { NextRequest, NextResponse } from "next/server";
import {fetchBecados,createBecadoController,} from "@/controllers/becados/becadosController";
import { cookies } from "next/headers";
import {verifyAccessToken,getUserIdFromSessionToken,} from "@/lib/auth/login_tools";
import { addLogEntry } from "@/models/admin/logModel";

// --- GET: Listar todos o Buscar ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const searchTerm = searchParams.get("search");
    const response = await fetchBecados(searchTerm || false);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /becados:", error);
    return NextResponse.json(
      { error: "Error al obtener los becados" },
      { status: 500 }
    );
  }
}

// --- POST: Crear un Becado ---
export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de Sesión y Auth
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;

    if (!token || !(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtención de datos
    // El nuevo controlador espera FormData explícitamente
    const formData = await req.formData();

    // 3. Llamada al Controlador
    // NOTA: El nuevo createBecadoController requiere (formData, userID)
    const response = await createBecadoController(formData, userId);

    // 4. Logging
    // Convertimos formData a objeto plano solo para el log (sin archivos binarios)
    const logData: any = {};
    formData.forEach((value, key) => {
      // Evitamos loguear archivos grandes
      if (typeof value === 'string') {
        logData[key] = value;
      } else {
        logData[key] = "[File]";
      }
    });

    await addLogEntry(
      userId,
      "createBecado",
      `data: ${JSON.stringify(logData)}`
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /becados:", error);
    return NextResponse.json(
      { error: "Error al crear becado" },
      { status: 500 }
    );
  }
}

/* NOTA: Se ha eliminado el método DELETE de este archivo raíz.
   El nuevo modelo basado en Prisma/Mongo no exporta una función para "Borrar Indice" 
   (DeleteIndiceBecados). Las eliminaciones individuales deben manejarse en 
   la ruta dinámica: ./becados/[id]/route.ts 
*/