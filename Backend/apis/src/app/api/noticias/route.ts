import { NextRequest, NextResponse } from "next/server";
import {listarNoticias,crearNoticia,} from "@/controllers/noticias/noticiasControllers"; 
import { cookies } from "next/headers";
import {verifyAccessToken,getUserIdFromSessionToken,} from "@/lib/auth/login_tools";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const indiceParam = searchParams.get("indice");
    const indice = indiceParam ? parseInt(indiceParam) : 0;

    const response = await listarNoticias(indice);
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json(
      { error: "Error al buscar noticias" },
      { status: 500 }
    );
  }
}

// ✅ Crear una noticia
export async function POST(request: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;

    // 1. Verificaciones de Seguridad
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtención del User ID (como String para MongoDB)
    const userId = await getUserIdFromSessionToken(sessionToken || "");
    
    if (!userId) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    }

    // 3. Procesamiento del FormData
    const formData = await request.formData();
    
    // 4. Llamada al Controlador
    // El controlador se encarga de crear la noticia en la DB y de registrar el LOG
    const response = await crearNoticia(formData, userId);

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

/* NOTA: El método DELETE ha sido eliminado de este archivo raíz.
   El modelo actual de MongoDB no incluye una función para "Borrar todo el índice" 
   (como se hacía en Elasticsearch). 
   
   Para borrar una noticia individual, utiliza la ruta dinámica:
   ./noticias/[id]/route.ts
*/