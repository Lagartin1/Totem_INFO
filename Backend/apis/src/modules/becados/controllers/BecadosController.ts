import { NextRequest } from "next/server";
import { HttpError, InternalServerError } from "@modules/shared/errors/HttpError";
import { ControllerResponse } from "@modules/shared/http/ControllerResponse";
import { BecadosService } from "../services/BecadosService";
import { BecadosSearchResult } from "../models/Becado";

export class BecadosController {
  static async search(
    req: NextRequest
  ): Promise<ControllerResponse<BecadosSearchResult | { error: string }>> {
    try {
      const searchTerm = (req.nextUrl.searchParams.get("q") ?? "").trim();
      const result = await BecadosService.search(searchTerm);
      return { status: 200, body: result };
    } catch (error) {
      const handledError =
        error instanceof HttpError
          ? error
          : new InternalServerError("Error al buscar becados");

      if (!(error instanceof HttpError)) {
        console.error("Error en GET /becados:", error);
      }

      return {
        status: handledError.status,
        body: { error: handledError.message },
      };
    }
  }
}
