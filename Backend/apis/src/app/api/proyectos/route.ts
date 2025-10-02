import { NextRequest } from "next/server";
import { ProyectosController } from "@modules/proyectos/controllers/ProyectosController";
import { toNextResponse } from "@modules/shared/http/ControllerResponse";

export async function GET(req: NextRequest) {
  const response = await ProyectosController.search(req);
  return toNextResponse(response);
}
