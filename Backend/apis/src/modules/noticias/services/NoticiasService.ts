import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { extractHits, extractTotal } from "@modules/shared/utils/searchResponse";
import { NoticiasSearchResult, Noticia } from "../models/Noticia";
import { NoticiasRepository } from "../repositories/NoticiasRepository";

export class NoticiasService {
  static async search(searchTerm: string): Promise<NoticiasSearchResult> {
    const query = this.buildQuery(searchTerm);
    const response = await NoticiasRepository.search(query);

    const noticias = extractHits<Noticia>(response);
    const total = extractTotal(response);

    return { noticias, total };
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
          fields: ["titulo", "descripcion"],
          analyzer: "spanish",
        },
      },
      {
        multi_match: {
          query: searchTerm,
          fields: ["titulo", "descripcion"],
          fuzziness: "AUTO",
          analyzer: "spanish",
        },
      },
    ];

    return {
      bool: {
        should,
        minimum_should_match: 1,
      },
    };
  }
}
