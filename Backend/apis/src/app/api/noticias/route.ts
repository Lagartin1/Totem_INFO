// pages/api/noticias.ts
import { NextResponse } from "next/server";
import { listarNoticias, actualizarNoticia, crearNoticia, eliminarNoticia } from "@/controllers/noticias/noticiasControllers";


export async function GET() {
  try {
    const response = await listarNoticias();
    return NextResponse.json( response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json({ error: "Error al buscar noticias" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const response = await actualizarNoticia(id, body);
    return NextResponse.json({ message: "Noticia actualizada correctamente", response }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    return NextResponse.json({ error: "Error al actualizar la noticia" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await crearNoticia(body);
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const response = await eliminarNoticia(id);
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