import { NextRequest, NextResponse } from "next/server";
import { tesisController } from "@/controllers/tesis/tesisControllers";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = (searchParams.get("q") || "").trim();
    let response:any;
    if (searchTerm === "") {
      response = await tesisController(false);
    }
    else {
      response = await tesisController(searchTerm);
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /tesis:", error);
    return NextResponse.json({ error: "Error al buscar tesis" }, { status: 500 });
  }
}
