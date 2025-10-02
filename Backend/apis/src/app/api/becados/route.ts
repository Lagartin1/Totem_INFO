import { NextRequest, NextResponse } from "next/server";
import {fetchBecados} from "@/controllers/becados/becadosController";

const INDEX = process.env.BECADOS_INDEX || "becados";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = (searchParams.get("q") || "").trim();
    let response;
    if (searchTerm) {
      response = await fetchBecados(searchTerm);
    } else {
      response = await fetchBecados(false);
    }
    if (!response) {
      return NextResponse.json({ error: "No se encontraron becados" }, { status: 404 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Error en /api/becados:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
