import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";
import { desactivarPractica } from "@/controllers/practicas/practicasController";
import { request } from "https";

export async function PUT(req: NextRequest) { 
  try {
    // El middleware ya verificó el access_token
    const jar = await cookies();
    const sessionToken = jar.get("refresh_token")?.value;
    const userId = await getUserIdFromSessionToken(sessionToken || "");

    return desactivarPractica(req,userId || "");

  } catch (error) {
    return new Response(JSON.stringify({ ok: false, message: "Error al actualizar el estado de la práctica." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}