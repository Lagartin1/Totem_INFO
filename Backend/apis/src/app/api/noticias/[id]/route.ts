import { NextRequest, NextResponse } from "next/server";
import { eliminarNoticia, actualizarNoticia } from "@/controllers/noticias/noticiasControllers";
import { cookies } from "next/headers";
import { 
  verifyAccessToken, 
  getUserIdFromSessionToken 
} from "@/lib/auth/login_tools";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    const sessionToken = jar.get('refresh_token')?.value;

    if (!token || !(await verifyAccessToken(token))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(sessionToken || '');
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const { id } = await params;
    const response = await eliminarNoticia(id, userId); 

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

// --- PUT handler ---
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    const sessionToken = jar.get('refresh_token')?.value;

    if (!token || !(await verifyAccessToken(token))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(sessionToken || '');
      
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const response = await actualizarNoticia(id, formData, userId);

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