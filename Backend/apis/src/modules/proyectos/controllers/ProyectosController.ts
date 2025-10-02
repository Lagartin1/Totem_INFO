import { NextRequest } from "next/server";
import { HttpError, InternalServerError } from "@modules/shared/errors/HttpError";
import { ControllerResponse } from "@modules/shared/http/ControllerResponse";
import { ProyectosService } from "../services/ProyectosService";
import { ProyectosSearchResult } from "../models/Proyecto";

export class ProyectosController {
  static async search(
    req: NextRequest
  ): Promise<ControllerResponse<ProyectosSearchResult | { error: string }>> {
    try {
      const searchTerm = (req.nextUrl.searchParams.get("q") ?? "").trim();
      const result = await ProyectosService.search(searchTerm);
      return { status: 200, body: result };
    } catch (error) {
      const handledError =
        error instanceof HttpError
          ? error
          : new InternalServerError("Error al buscar proyectos");

      if (!(error instanceof HttpError)) {
        console.error("Error en GET /proyectos:", error);
      }

      return {
        status: handledError.status,
        body: { error: handledError.message },
      };
    }
  }
}
