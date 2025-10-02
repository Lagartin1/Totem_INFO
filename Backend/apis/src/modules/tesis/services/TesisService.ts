import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { extractHits, extractTotal } from "@modules/shared/utils/searchResponse";
import { TesisRepository } from "../repositories/TesisRepository";
import { Tesis, TesisSearchResult } from "../models/Tesis";

export class TesisService {
  static async search(searchTerm: string): Promise<TesisSearchResult> {
    const query = this.buildQuery(searchTerm);
    const initialResponse = await TesisRepository.initialSearch(query);

    const tesis = extractHits<Tesis>(initialResponse);
    const total = extractTotal(initialResponse);

    let activeScrollId = initialResponse._scroll_id ?? undefined;

    try {
      while (activeScrollId) {
        const scrollResponse = await TesisRepository.scroll(activeScrollId);
        const scrollHits = extractHits<Tesis>(scrollResponse);
        const nextScrollId = scrollResponse._scroll_id ?? activeScrollId;

        if (scrollHits.length === 0) {
          activeScrollId = nextScrollId;
          break;
        }

        tesis.push(...scrollHits);

        activeScrollId = nextScrollId;
      }
    } finally {
      if (activeScrollId) {
        try {
          await TesisRepository.clearScroll(activeScrollId);
        } catch (error) {
          console.error("Error al liberar scroll de tesis", error);
        }
      }
    }

    return { tesis, total };
  }

  private static buildQuery(searchTerm: string): QueryDslQueryContainer {
    if (!searchTerm) {
      return { match_all: {} };
    }

    const should: QueryDslQueryContainer[] = [
      {
        multi_match: {
          query: searchTerm,
          fields: [
            "titulo",
            "profesor",
            "area_desarrollo",
            "descripcion",
            "autor",
            "universidad",
            "facultad",
            "palabras_clave",
            "resumen",
          ],
          fuzziness: "AUTO",
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
