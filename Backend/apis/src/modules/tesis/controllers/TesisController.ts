import { NextRequest } from "next/server";
import { HttpError, InternalServerError } from "@modules/shared/errors/HttpError";
import { ControllerResponse } from "@modules/shared/http/ControllerResponse";
import { TesisService } from "../services/TesisService";
import { TesisSearchResult } from "../models/Tesis";

export class TesisController {
  static async search(
    req: NextRequest
  ): Promise<ControllerResponse<TesisSearchResult | { error: string }>> {
    try {
      const searchTerm = (req.nextUrl.searchParams.get("q") ?? "").trim();
      const result = await TesisService.search(searchTerm);
      return { status: 200, body: result };
    } catch (error) {
      const handledError =
        error instanceof HttpError
          ? error
          : new InternalServerError("Error al buscar tesis");

      if (!(error instanceof HttpError)) {
        console.error("Error en GET /tesis:", error);
      }

      return {
        status: handledError.status,
        body: { error: handledError.message },
      };
    }
  }
}
