import { NextRequest, NextResponse } from "next/server";
import { 
  DeleteGirasController, 
  PutGirasController 
} from "@/controllers/giras/girasController";
import { cookies } from "next/headers";
import { 
  verifyAccessToken, 
  getUserIdFromSessionToken 
} from "@/lib/auth/login_tools";

// DELETE: Eliminar una gira
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // El middleware ya verificó el access_token
    const jar = await cookies();  
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 3. Obtener ID de la gira
    const { id } = await params;

    // 4. Ejecutar Controlador
    // Pasamos el userId para que el controlador registre el LOG internamente
    const response = await DeleteGirasController(id, userId);

    return NextResponse.json(
      { message: "Gira eliminada correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar gira:", error);
    return NextResponse.json(
      { error: "Error al eliminar la gira" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar una gira
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // El middleware ya verificó el access_token
    const jar = await cookies();  
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 3. Obtener datos
    const { id } = await params;
    const formData = await request.formData();

    // 4. Ejecutar Controlador
    // Pasamos id, formData y userId. El controlador maneja la actualización y el LOG.
    const response = await PutGirasController(id, formData, userId);

    return NextResponse.json(
      { message: "Gira actualizada correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar la gira:", error);
    return NextResponse.json(
      { error: "Error al actualizar la gira" },
      { status: 500 }
    );
  }
}