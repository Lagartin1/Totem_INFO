import { NextRequest, NextResponse } from "next/server";
import {
  proyectosController, // Usamos el controlador principal para soportar búsqueda y paginación
  createProyectoController,
} from "@/controllers/proyectos/proyectosController";
import { cookies } from "next/headers";
import {
  verifyAccessToken,
  getUserIdFromSessionToken,
} from "@/lib/auth/login_tools";

// ✅ GET: Listar proyectos (con soporte para búsqueda y paginación)
export async function GET(request: NextRequest) {
  try {
    // Extraemos parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get("search") || undefined;
    const indice = parseInt(searchParams.get("indice") || "0");

    // Llamamos al controlador versátil que maneja búsqueda o listado simple
    const response = await proyectosController(searchTerm, indice);
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /proyectos:", error);
    return NextResponse.json(
      { error: "Error al buscar proyectos" },
      { status: 500 }
    );
  }
}

// ✅ POST: Crear un nuevo proyecto
export async function POST(req: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;

    // 1. Verificación de Auth
    if (!token || !(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener User ID (String)
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Obtener datos
    const formData = await req.formData();

    // 4. Ejecutar Controlador
    // Pasamos formData y userId. El controlador maneja la creación en DB y el LOG.
    const response = await createProyectoController(formData, userId);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /proyectos:", error);
    return NextResponse.json(
      { error: "Error al crear proyecto" },
      { status: 500 }
    );
  }
}