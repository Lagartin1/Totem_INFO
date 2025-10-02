import { NextRequest } from "next/server";
import { ControllerResponse } from "@modules/shared/http/ControllerResponse";
import { HealthService } from "../services/HealthService";

export class HealthController {
  static status(): ControllerResponse<ReturnType<typeof HealthService.getStatus>[]> {
    return { status: 200, body: [HealthService.getStatus()] };
  }

  static async create(
    req: NextRequest
  ): Promise<ControllerResponse<{ creado: unknown } | { error: string }>> {
    try {
      const body = await req.json();
      return { status: 201, body: { creado: body } };
    } catch (error) {
      console.error("Error en POST /health:", error);
      return {
        status: 400,
        body: { error: "Cuerpo de solicitud inválido" },
      };
    }
  }
}
