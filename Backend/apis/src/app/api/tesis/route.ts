import { NextRequest } from "next/server";
import { TesisController } from "@modules/tesis/controllers/TesisController";
import { toNextResponse } from "@modules/shared/http/ControllerResponse";

export async function GET(req: NextRequest) {
  const response = await TesisController.search(req);
  return toNextResponse(response);
}
