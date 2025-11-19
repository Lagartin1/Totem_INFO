import { NextRequest, NextResponse } from "next/server";
import {DeleteProyectosController,PutProyectosController} from "@/controllers/proyectos/proyectosController";
import { cookies } from "next/headers";
import {verifyAccessToken,getUserIdFromSessionToken} from "@/lib/auth/login_tools";

export async function DELETE(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Autenticación
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;

    if (!token || !(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener User ID (String)
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Obtener ID del proyecto
    const { id } = await params;

    // 4. Ejecutar Controlador
    // Pasamos el userId para que el controlador registre el LOG internamente
    const response = await DeleteProyectosController(id, userId);

    return NextResponse.json(
      { message: "Proyecto eliminado correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el proyecto" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un proyecto
export async function PUT(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Autenticación
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;

    if (!token || !(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener User ID (String)
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Obtener datos
    const { id } = await params;
    const formData = await request.formData();

    // 4. Ejecutar Controlador
    // Pasamos id, formData y userId.
    const response = await PutProyectosController(id, formData, userId);

    return NextResponse.json(
      { message: "Proyecto actualizado correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el proyecto" },
      { status: 500 }
    );
  }
}