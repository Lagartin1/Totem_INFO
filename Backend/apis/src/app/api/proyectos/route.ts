import { NextRequest, NextResponse } from "next/server";
import {createProyectoController, GetProyectosController} from "@/controllers/proyectos/proyectosController"

export async function GET() {
  try {
    const response = await GetProyectosController();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json({ error: "Error al buscar noticias" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await createProyectoController(formData);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /proyectos:", error);
    return NextResponse.json(
      { error: "Error al crear proyecto" },
      { status: 500 }
    );
  }
}