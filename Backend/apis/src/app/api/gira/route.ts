import { NextRequest, NextResponse } from "next/server";
import {
  createGiraController,
  GetGirasController,
} from "@/controllers/giras/girasController";
import { cookies } from "next/headers";
import {
  verifyAccessToken,
  getUserIdFromSessionToken,
} from "@/lib/auth/login_tools";

// ✅ GET: Obtener todas las giras
export async function GET(request: NextRequest) {
  try {
    // Nota: Si en el futuro actualizas GetGirasController para aceptar paginación 
    // (como hiciste con Noticias), aquí deberías leer searchParams.
    // Por ahora, usamos el controlador tal cual se definió (sin argumentos).
    const response = await GetGirasController();
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /giras:", error);
    return NextResponse.json(
      { error: "Error al buscar giras" },
      { status: 500 }
    );
  }
}

// ✅ POST: Crear una nueva gira
export async function POST(req: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;

    // 1. Verificación de Auth
    if (!token || !(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener User ID (String para MongoDB/Prisma)
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Obtener datos del formulario
    const formData = await req.formData();

    // 4. Llamar al Controlador
    // Pasamos formData y userId. El controlador se encarga de la creación y del LOG.
    const response = await createGiraController(formData, userId);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /giras:", error);
    return NextResponse.json(
      { error: "Error al crear la gira" },
      { status: 500 }
    );
  }
}