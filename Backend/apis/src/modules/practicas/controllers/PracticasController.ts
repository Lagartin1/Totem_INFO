import { NextRequest } from "next/server";
import { HttpError, InternalServerError } from "@modules/shared/errors/HttpError";
import { ControllerResponse } from "@modules/shared/http/ControllerResponse";
import { PracticasService } from "../services/PracticasService";
import { PracticasSearchResult } from "../models/Practica";

export class PracticasController {
  static async search(
    req: NextRequest,
    type: string
  ): Promise<ControllerResponse<PracticasSearchResult | { error: string }>> {
    try {
      const searchParams = req.nextUrl.searchParams;
      const result = await PracticasService.search({
        type,
        page: searchParams.get("pagina"),
        year: searchParams.get("year"),
      });

      return { status: 200, body: result };
    } catch (error) {
      const handledError =
        error instanceof HttpError
          ? error
          : new InternalServerError("Error al buscar prácticas");

      if (!(error instanceof HttpError)) {
        console.error(`Error en GET /practicas/${type}:`, error);
      }

      return {
        status: handledError.status,
        body: { error: handledError.message },
      };
    }
  }

  static async create(
    req: NextRequest
  ): Promise<ControllerResponse<{ creado: unknown } | { error: string }>> {
    try {
      const body = await req.json();
      return { status: 201, body: { creado: body } };
    } catch (error) {
      console.error("Error al crear práctica:", error);
      return { status: 500, body: { error: "Error al crear práctica" } };
    }
  }

  static options(): ControllerResponse<null> {
    return {
      status: 204,
      body: null,
      headers: {
        "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    };
  }
}
