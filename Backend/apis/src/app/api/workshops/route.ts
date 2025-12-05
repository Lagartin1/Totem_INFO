import { NextRequest, NextResponse } from "next/server";
import {getAllWorkshopsFromDb,createWorkshopInDb,updateWorkshopInDb,deleteWorkshopInDb,} from "@/controllers/workshop/workshopController"; 
import { cookies } from "next/headers";
import {verifyAccessToken,getUserIdFromSessionToken,} from "@/lib/auth/login_tools";

// ✅ GET: Listar workshops (con paginación)
export async function GET(request: NextRequest) {
  try {
    // Extraemos el parámetro 'pagina' de la URL
    const searchParams = request.nextUrl.searchParams;
    const pagina = searchParams.get("pagina") || "1";

    const response = await getAllWorkshopsFromDb(pagina);
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /workshop:", error);
    return NextResponse.json(
      { error: "Error al obtener workshops" },
      { status: 500 }
    );
  }
}

// ✅ POST: Crear un workshop
export async function POST(request: NextRequest) {
  return handleAuthenticatedRequest(request, createWorkshopInDb);
}

// ✅ PUT: Actualizar un workshop
export async function PUT(request: NextRequest) {
  return handleAuthenticatedRequest(request, updateWorkshopInDb);
}

// ✅ DELETE: Eliminar un workshop
export async function DELETE(request: NextRequest) {
  return handleAuthenticatedRequest(request, deleteWorkshopInDb);
}

async function handleAuthenticatedRequest(
  request: NextRequest,
  controllerFunction: (req: NextRequest, userId: string) => Promise<any>
) {
  try {
    // El middleware ya verificó el access_token
    const jar = await cookies();
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ejecutamos la función del controlador pasándole el Request y el UserID
    const response = await controllerFunction(request, userId);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error en /workshop [${request.method}]:`, error);
    return NextResponse.json(
      { error: `Error al procesar la solicitud ${request.method}` },
      { status: 500 }
    );
  }
}