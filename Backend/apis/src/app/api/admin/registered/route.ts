
import { NextRequest, NextResponse } from "next/server";
import { registeredController } from "@/controllers/admin/registeredController";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pagina = searchParams.get('pagina') || '1';
  
  return registeredController(req, pagina)


}

