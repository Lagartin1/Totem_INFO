import { NextRequest, NextResponse } from "next/server";
import { eliminarNoticia, actualizarNoticia } from "@/controllers/noticias/noticiasControllers";
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";
import { addLogEntry } from "@/services/admin/logs";



// DELETE handler
export async function DELETE(request: NextRequest, context: any) {
  try {
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    const sessionToken = jar.get('refresh_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await verifyAccessToken(token))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    const userId = await getUserIdFromSessionToken(sessionToken || '');
    const userIdNumber = userId ? parseInt(userId) : null;
    
    if (!userIdNumber) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });
    }
    const { id } = context.params; // <- usar context sin tipar
    const response = await eliminarNoticia(id); 
    await addLogEntry(userIdNumber, 'delete_news', `Eliminó la noticia con ID ${id}`); 

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

// PUT handler
export async function PUT(request: NextRequest, context: any) {
  try {
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    const sessionToken = jar.get('refresh_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await verifyAccessToken(token))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    const userId = await getUserIdFromSessionToken(sessionToken || '');
    const userIdNumber = userId ? parseInt(userId) : null;
      
    if (!userIdNumber) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });
    }
    const { id } = context.params;
    const body = await request.formData();

    const response = await actualizarNoticia(id, body);
    await addLogEntry(userIdNumber, 'update_news', `Actualizó la noticia con ID ${id}`);
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
