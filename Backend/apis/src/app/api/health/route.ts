import { NextRequest } from "next/server";
import { HealthController } from "@modules/health/controllers/HealthController";
import { toNextResponse } from "@modules/shared/http/ControllerResponse";

export async function GET() {
  const response = HealthController.status();
  return toNextResponse(response);
}

export async function POST(req: NextRequest) {
  const response = await HealthController.create(req);
  return toNextResponse(response);
}
