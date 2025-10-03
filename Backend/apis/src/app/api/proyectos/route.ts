import { NextRequest, NextResponse } from "next/server";
import {proyectosController} from "@/controllers/proyectos/proyectosController"
const INDEX = process.env.PROYCTS_INDEX || "proyects";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = (searchParams.get("q") || "").trim();
    const response = await proyectosController(searchTerm || undefined);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Error en GET /proyectos:", error);
    return NextResponse.json({ error: "Error al buscar proyectos" }, { status: 500 });
  }
}
