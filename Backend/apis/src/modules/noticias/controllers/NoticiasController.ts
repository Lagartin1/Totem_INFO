import { NextRequest } from "next/server";
import { HttpError, InternalServerError } from "@modules/shared/errors/HttpError";
import { ControllerResponse } from "@modules/shared/http/ControllerResponse";
import { NoticiasService } from "../services/NoticiasService";
import { NoticiasSearchResult } from "../models/Noticia";

export class NoticiasController {
  static async search(
    req: NextRequest
  ): Promise<ControllerResponse<NoticiasSearchResult | { error: string }>> {
    try {
      const searchTerm = (req.nextUrl.searchParams.get("q") ?? "").trim();
      const result = await NoticiasService.search(searchTerm);
      return { status: 200, body: result };
    } catch (error) {
      const handledError =
        error instanceof HttpError
          ? error
          : new InternalServerError("Error al buscar noticias");

      if (!(error instanceof HttpError)) {
        console.error("Error en GET /noticias:", error);
      }

      return {
        status: handledError.status,
        body: { error: handledError.message },
      };
    }
  }
}
