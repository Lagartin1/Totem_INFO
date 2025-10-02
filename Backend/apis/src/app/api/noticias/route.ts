// pages/api/noticias.ts
import { NextRequest, NextResponse } from "next/server";
import { listarNoticas } from "@/controllers/noticias/noticasControllers";
const INDEX = process.env.NOTICIAS_INDEX || "noticias";


export async function GET() {
  try {
    const response = await listarNoticas();
    return NextResponse.json( response, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json({ error: "Error al buscar noticias" }, { status: 500 });
  }
}