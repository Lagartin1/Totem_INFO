import { NextRequest } from "next/server";
import { getPracticaDetails } from "@/controllers/practicas/practicasController";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Extraemos el ID de la promesa params (Next.js 15 standard)
  const { id } = await params;

  // Tu controlador ya retorna un NextResponse, así que lo retornamos directamente
  return await getPracticaDetails(id);
}