import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { BadRequestError } from "@modules/shared/errors/HttpError";
import { extractHits, extractTotal } from "@modules/shared/utils/searchResponse";
import { PracticasSearchResult, Practica } from "../models/Practica";
import { PracticasRepository } from "../repositories/PracticasRepository";

interface SearchOptions {
  type: string;
  page?: string | null;
  year?: string | null;
}

export class PracticasService {
  private static readonly PAGE_SIZE = 10;
  private static readonly PRACTICA_TYPES: Record<string, string> = {
    profesional: "Profesional",
    inicial: "Inicial",
  };

  static async search({ type, page, year }: SearchOptions): Promise<PracticasSearchResult> {
    const tipoPractica = this.resolveTipo(type);
    const pageNumber = this.parsePage(page);
    const parsedYear = this.parseYear(year);

    const query = this.buildQuery(tipoPractica, parsedYear ?? undefined);
    const response = await PracticasRepository.search({
      query,
      from: (pageNumber - 1) * this.PAGE_SIZE,
      size: this.PAGE_SIZE,
    });

    const practicas = extractHits<Practica>(response);
    const total = extractTotal(response);

    return { practicas, total };
  }

  private static resolveTipo(type: string) {
    const normalizedType = type.toLowerCase();
    const resolvedType = this.PRACTICA_TYPES[normalizedType];

    if (!resolvedType) {
      throw new BadRequestError("Tipo de práctica no soportado");
    }

    return resolvedType;
  }

  private static parsePage(page?: string | null) {
    if (!page) {
      return 1;
    }

    const pageNumber = Number(page);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new BadRequestError("El número de página debe ser un entero positivo");
    }

    return pageNumber;
  }

  private static parseYear(year?: string | null) {
    if (!year) {
      return null;
    }

    const parsedYear = Number(year);

    if (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      throw new BadRequestError("El año debe ser un número válido entre 1900 y 2100");
    }

    return parsedYear;
  }

  private static buildQuery(tipoPractica: string, year?: number): QueryDslQueryContainer {
    if (!year) {
      return { match: { tipo_practica: tipoPractica } };
    }

    return {
      bool: {
        must: [
          { term: { tipo_practica: tipoPractica } },
          {
            range: {
              created_at: {
                gte: `${year}-01-01`,
                lte: `${year}-12-31`,
              },
            },
          },
        ],
      },
    };
  }
}
