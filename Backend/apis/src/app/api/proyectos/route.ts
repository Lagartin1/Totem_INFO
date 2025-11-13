import { NextRequest, NextResponse } from "next/server";
import {createProyectoController, GetProyectosController} from "@/controllers/proyectos/proyectosController"
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";
import { addLogEntry } from "@/models/admin/logModel";


export async function GET() {
  try {
    const response = await GetProyectosController();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /proyectos:", error);
    return NextResponse.json({ error: "Error al buscar proyectos" }, { status: 500 });
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

    const response = await createProyectoController(formData);    
    await addLogEntry(userId, "createProyecto", `data: ${JSON.stringify(formData)}`);  

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /proyectos:", error);
    return NextResponse.json(
      { error: "Error al crear proyecto" },
      { status: 500 }
    );
  }
}