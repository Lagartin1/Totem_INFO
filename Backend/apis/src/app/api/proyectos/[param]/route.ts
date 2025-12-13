import { NextRequest, NextResponse } from "next/server";
import {DeleteProyectosController, PutProyectosController} from "@/controllers/proyectos/proyectosController";
import { proyectosController } from "@/controllers/proyectos/proyectosController";
import { mongoClient } from "@/database/mongodb";
import { cookies } from "next/headers";
import {getUserIdFromSessionToken} from "@/lib/auth/login_tools";

// Helper para detectar si es un tipo válido
function isTipoValido(param: string): boolean {
  return param === "profesores" || param === "estudiantes";
}

// ✅ GET: Listar proyectos filtrados por tipo O por ID específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await context.params;

    // Si el parámetro es un tipo válido, filtrar por tipo
    if (isTipoValido(param)) {
      const searchParams = request.nextUrl.searchParams;
      const searchTerm = searchParams.get("search") || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const indice = (page - 1) * 10;
      const pageSize = 10;
      let query: any = {};

      if (searchTerm) {
        query = {
          ...query,
          $or: [
            { titulo: { $regex: searchTerm, $options: "i" } },
            { descripcion: { $regex: searchTerm, $options: "i" } },
            { area_desarrollo: { $regex: searchTerm, $options: "i" } },
            { autores: { $in: [searchTerm] } },
          ],
        };
      }

      const [proyectos, total] = await mongoClient.$transaction([
        mongoClient.proyecto.findMany({
          where: query,
          orderBy: { createdAt: "desc" },
          skip: indice,
          take: pageSize,
        }),
        mongoClient.proyecto.count({ where: query }),
      ]);

      return NextResponse.json(
        {
          data: proyectos,
          total,
          page,
          pageSize,
          pages: Math.ceil(total / pageSize),
        },
        { status: 200 }
      );
    }

    // Si no es un tipo válido, tratarlo como ID y retornar proyecto específico
    const proyecto = await mongoClient.proyecto.findUnique({
      where: { id: param },
    });

    if (!proyecto) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(proyecto, { status: 200 });
  } catch (error) {
    console.error("Error en GET /proyectos/[param]:", error);
    return NextResponse.json(
      { error: "Error al buscar proyectos" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un proyecto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const jar = await cookies();
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { param } = await params;

    // No permitir eliminar con tipos (solo con IDs)
    if (isTipoValido(param)) {
      return NextResponse.json(
        { error: "No se puede eliminar usando un tipo. Use un ID específico." },
        { status: 400 }
      );
    }

    const response = await DeleteProyectosController(param, userId);

    return NextResponse.json(
      { message: "Proyecto eliminado correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el proyecto" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un proyecto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const jar = await cookies();
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { param } = await params;

    // No permitir actualizar con tipos (solo con IDs)
    if (isTipoValido(param)) {
      return NextResponse.json(
        { error: "No se puede actualizar usando un tipo. Use un ID específico." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const response = await PutProyectosController(param, formData, userId);

    return NextResponse.json(
      { message: "Proyecto actualizado correctamente", response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el proyecto" },
      { status: 500 }
    );
  }
}
