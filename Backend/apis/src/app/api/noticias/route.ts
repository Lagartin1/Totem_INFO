import { NextRequest } from "next/server";
import { NoticiasController } from "@modules/noticias/controllers/NoticiasController";
import { toNextResponse } from "@modules/shared/http/ControllerResponse";

export async function GET(req: NextRequest) {
  const response = await NoticiasController.search(req);
  return toNextResponse(response);
}
