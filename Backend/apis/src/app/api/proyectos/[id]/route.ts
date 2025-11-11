import { NextResponse } from "next/server";
import { DeleteProyectosController, PutProyectosController } from "@/controllers/proyectos/proyectosController";
import { addLogEntry } from "@/models/admin/logModel";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserIdFromSessionToken } from "@/lib/auth/login_tools";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const jar = await cookies();  
    const token = jar.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(token || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const response = await DeleteProyectosController(id);
    await addLogEntry(userId, "deleteProyecto", `Proyecto eliminado con ID: ${params.id}`);
    return NextResponse.json(
      { message: "Noticia eliminada correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    return NextResponse.json(
      { error: "Error al eliminar la noticia" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const jar = await cookies();  
    const token = jar.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(token || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const body = await request.formData();
    await addLogEntry(userId, "updateProyecto", `Proyecto actualizado con ID: ${params.id}`);
    const response = await PutProyectosController(id, body);
    return NextResponse.json(
      { message: "Noticia actualizada correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    return NextResponse.json(
      { error: "Error al actualizar la noticia" },
      { status: 500 }
    );
  }
}