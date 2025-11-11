import { NextRequest, NextResponse } from "next/server";
import {
  createBecadoController,
  GetBecadosController,
} from "@/controllers/becados/becadosController";
import { cookies } from "next/headers";
import {
  verifyAccessToken,
  getUserIdFromSessionToken,
} from "@/lib/auth/login_tools";
import { addLogEntry } from "@/models/admin/logModel";
import { DeleteIndiceBecados } from "@/models/becados/becadosModel";

export async function GET() {
  try {
    const response = await GetBecadosController();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /becados:", error);
    return NextResponse.json(
      { error: "Error al buscar becados" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(token || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const response = await createBecadoController(formData);
    await addLogEntry(
      userId,
      "createBecado",
      `data: ${JSON.stringify(formData)}`
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /becados:", error);
    return NextResponse.json(
      { error: "Error al crear becado" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const deleteAll = searchParams.get("all") === "true";

  if (deleteAll) {
    const response = await DeleteIndiceBecados();
    return NextResponse.json(
      { message: "Índice eliminado", response },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { error: "Falta parámetro all=true" },
    { status: 400 }
  );
}
