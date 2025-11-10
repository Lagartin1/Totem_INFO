import { NextRequest, NextResponse } from "next/server";
import { eliminarNoticia, actualizarNoticia } from "@/controllers/noticias/noticiasControllers";

// DELETE handler
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { id } = context.params; // <- usar context sin tipar
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

// PUT handler
export async function PUT(request: NextRequest, context: any) {
  try {
    const { id } = context.params;
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
