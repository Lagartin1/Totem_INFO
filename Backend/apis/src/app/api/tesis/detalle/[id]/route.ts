import { NextRequest, NextResponse } from "next/server";
import { getTesisDetails } from "@/controllers/tesis/tesisControllers";

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id;
    return await getTesisDetails(id);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
