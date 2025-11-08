import { NextResponse } from "next/server";
import {
  listarNoticias,
  crearNoticia,
  DeleteIndiceNoticias,
} from "@/controllers/noticias/noticiasControllers";

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
    const formData = await request.formData();
    const response = await crearNoticia(formData);

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
  const { searchParams } = new URL(request.url);
  const deleteAll = searchParams.get("all") === "true";

  if (deleteAll) {
    const response = await DeleteIndiceNoticias();
    return NextResponse.json({ message: "Índice eliminado", response }, { status: 200 });
  }

  return NextResponse.json({ error: "Falta parámetro all=true" }, { status: 400 });
}
