import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { extractHits, extractTotal } from "@modules/shared/utils/searchResponse";
import { Becado, BecadosSearchResult } from "../models/Becado";
import { BecadosRepository } from "../repositories/BecadosRepository";

export class BecadosService {
  static async search(searchTerm: string): Promise<BecadosSearchResult> {
    const query = this.buildQuery(searchTerm);
    const response = await BecadosRepository.search(query);

    const becados = extractHits<Becado>(response);
    const total = extractTotal(response);

    return { becados, total };
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
          fields: ["nombre", "titulo", "descripcion"],
          analyzer: "spanish",
        },
      },
      {
        multi_match: {
          query: searchTerm,
          fields: ["nombre", "titulo", "descripcion"],
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
