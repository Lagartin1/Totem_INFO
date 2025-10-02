import { NextRequest } from "next/server";
import { BecadosController } from "@modules/becados/controllers/BecadosController";
import { toNextResponse } from "@modules/shared/http/ControllerResponse";

export async function GET(req: NextRequest) {
  const response = await BecadosController.search(req);
  return toNextResponse(response);
}
