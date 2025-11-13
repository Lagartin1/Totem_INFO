import { NextRequest, NextResponse } from "next/server";
import {createGiraController, GetGirasController} from "@/controllers/giras/girasController"
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";
import { addLogEntry } from "@/models/admin/logModel";


export async function GET() {
  try {
    const response = await GetGirasController();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /giras:", error);
    return NextResponse.json({ error: "Error al buscar giras" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const jar = await cookies();  
    const token = jar.get("access_token")?.value;
    const sessionToken = jar.get("refresh_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromSessionToken(sessionToken || "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const response = await createGiraController(formData);    
    await addLogEntry(userId, "createGira", `data: ${JSON.stringify(formData)}`);  

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error en POST /giras:", error);
    return NextResponse.json(
      { error: "Error al crear laa gira" },
      { status: 500 }
    );
  }
}