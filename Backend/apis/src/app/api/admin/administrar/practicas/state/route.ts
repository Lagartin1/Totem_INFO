import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";
import { desactivarPractica } from "@/controllers/practicas/practicasController";
import { request } from "https";

export async function PUT(req: NextRequest) { 
  try {
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const verified = await verifyAccessToken(token);
    if (!verified) {
      return new Response(JSON.stringify({ ok: false, message: "No autorizado." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // traer id del usuario ,
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