// pages/api/noticias.ts
import { NextResponse } from "next/server";
import { listarNoticias } from "@/controllers/noticias/noticiasControllers";


export async function GET() {
  try {
    const response = await listarNoticias();
    return NextResponse.json( response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json({ error: "Error al buscar noticias" }, { status: 500 });
  }
}