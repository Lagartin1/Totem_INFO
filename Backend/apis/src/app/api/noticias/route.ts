import { NextResponse } from "next/server";
import {
  listarNoticias,
  crearNoticia,
  DeleteIndiceNoticias,
} from "@/controllers/noticias/noticiasControllers";
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";
import { addLogEntry } from "@/services/admin/logs";
// ✅ Obtener todas las noticias
export async function GET() {
  try {
    const response = await listarNoticias();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json({ error: "Error al buscar noticias" }, { status: 500 });
  }
}

// ✅ Crear una noticia (con imagen)
export async function POST(request: Request) {
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

    const formData = await request.formData();
    const response = await crearNoticia(formData);
    
    if (!userIdNumber) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });
    }
    await addLogEntry(userIdNumber, 'create_news', `Creó una noticia`);

    return NextResponse.json(
      { message: "Noticia creada correctamente", response },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /noticias:", error);
    return NextResponse.json(
      { error: "Error al crear la noticia" },
      { status: 500 }
    );
  }
}

// ✅ Eliminar todas las noticias (índice completo)
export async function DELETE(request: Request) {
  const jar = await cookies();
  const token = jar.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const userId = await getUserIdFromSessionToken(jar.get('refresh_token')?.value || '');
  const userIdNumber = userId ? parseInt(userId) : null;
  if (!userIdNumber) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const deleteAll = searchParams.get("all") === "true";
  await addLogEntry(userIdNumber, 'delete_news_index', `Eliminó el índice completo de noticias`);
  if (deleteAll) {
    const response = await DeleteIndiceNoticias();
    return NextResponse.json({ message: "Índice eliminado", response }, { status: 200 });
  }

  return NextResponse.json({ error: "Falta parámetro all=true" }, { status: 400 });
}
