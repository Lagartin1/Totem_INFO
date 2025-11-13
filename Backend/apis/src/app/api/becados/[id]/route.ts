import { NextResponse } from "next/server";
import { DeleteBecadosController, PutBecadosController } from "@/controllers/becados/becadosController";
import { addLogEntry } from "@/models/admin/logModel";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserIdFromSessionToken } from "@/lib/auth/login_tools";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const jar = await cookies();  
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    const response = await DeleteBecadosController(id);
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const jar = await cookies();  
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.formData();
    await addLogEntry(userId, "updateBecado", `Becado actualizado con ID: ${id}`);
    const response = await PutBecadosController(id, body);
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