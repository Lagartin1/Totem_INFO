import { NextResponse } from "next/server";
import { DeleteGirasController, PutGirasController } from "@/controllers/giras/girasController";
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
    const response = await DeleteGirasController(id);
    await addLogEntry(userId, "deleteGira", `Gira eliminada con ID: ${id}`);
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
    await addLogEntry(userId, "updateGira", `Gira actualizada con ID: ${id}`);
    const response = await PutGirasController(id, body);
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