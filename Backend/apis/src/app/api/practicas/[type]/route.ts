import { NextRequest } from "next/server";
import { PracticasController } from "@modules/practicas/controllers/PracticasController";
import { toNextResponse } from "@modules/shared/http/ControllerResponse";

export async function GET(
  req: NextRequest,
  context: { params: { type: string } }
) {
  const { type } = context.params;
  const response = await PracticasController.search(req, type);
  return toNextResponse(response);
}

export async function POST(req: NextRequest) {
  const response = await PracticasController.create(req);
  return toNextResponse(response);
}

export function OPTIONS() {
  const response = PracticasController.options();
  return toNextResponse(response);
}
