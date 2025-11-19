import { NextRequest, NextResponse } from "next/server";
import { DeleteBecadosController, PutBecadosController } from "@/controllers/becados/becadosController";
import { addLogEntry } from "@/models/admin/logModel";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserIdFromSessionToken } from "@/lib/auth/login_tools";

// --- DELETE: Eliminar un becado específico ---
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticación
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
    
    // 2. Obtener ID y Ejecutar
    const { id } = await params;
    const response = await DeleteBecadosController(id);
    
    // 3. Log y Respuesta
    await addLogEntry(userId, "deleteBecado", `Becado eliminado con ID: ${id}`);
    
    return NextResponse.json(
      { message: "Becado eliminado correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar becado:", error);
    return NextResponse.json(
      { error: "Error al eliminar el becado" },
      { status: 500 }
    );
  }
}

// --- PUT: Actualizar un becado específico ---
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticación
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
    
    // 2. Obtener Datos
    const { id } = await params;
    
    // El controlador espera FormData. Si enviaras JSON desde el front, esto fallaría.
    // Asegúrate de que el frontend envíe FormData.
    const formData = await request.formData(); 

    // 3. Log
    await addLogEntry(userId, "updateBecado", `Becado actualizado con ID: ${id}`);
    
    // 4. Ejecutar Controlador
    const response = await PutBecadosController(id, formData);
    
    return NextResponse.json(
      { message: "Becado actualizado correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar becado:", error);
    return NextResponse.json(
      { error: "Error al actualizar el becado" },
      { status: 500 }
    );
  }
}