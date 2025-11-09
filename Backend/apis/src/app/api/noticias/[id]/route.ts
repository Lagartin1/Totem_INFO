import { NextResponse } from "next/server";
import { eliminarNoticia, actualizarNoticia } from "@/controllers/noticias/noticiasControllers";

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.formData();

    const response = await actualizarNoticia(id, body);
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
