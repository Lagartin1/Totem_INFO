import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { extractHits, extractTotal } from "@modules/shared/utils/searchResponse";
import { ProyectosRepository } from "../repositories/ProyectosRepository";
import { ProyectosSearchResult, Proyecto } from "../models/Proyecto";

export class ProyectosService {
  static async search(searchTerm: string): Promise<ProyectosSearchResult> {
    const query = this.buildQuery(searchTerm);
    const response = await ProyectosRepository.search(query);

    const proyectos = extractHits<Proyecto>(response);
    const total = extractTotal(response);

    return { proyectos, total };
  }

  private static buildQuery(searchTerm: string): QueryDslQueryContainer {
    if (!searchTerm) {
      return { match_all: {} };
    }

    const should: QueryDslQueryContainer[] = [
      {
        multi_match: {
          query: searchTerm,
          type: "phrase",
          fields: ["titulo", "profesores", "area_desarrollo"],
          analyzer: "spanish",
        },
      },
      {
        multi_match: {
          query: searchTerm,
          fields: ["titulo", "profesores", "area_desarrollo"],
          fuzziness: "AUTO",
          prefix_length: 1,
          analyzer: "spanish",
        },
      },
    ];

    const year = Number(searchTerm);
    if (!Number.isNaN(year) && year > 1900 && year < 2100) {
      should.push({
        range: {
          created_at: {
            gte: `${year}-01-01`,
            lt: `${year + 1}-01-01`,
          },
        },
      });
    }

    return {
      bool: {
        should,
        minimum_should_match: 1,
      },
    };
  }
}
