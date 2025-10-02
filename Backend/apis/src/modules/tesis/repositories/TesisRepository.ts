import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { es } from "@database/elastic";
import { Tesis } from "../models/Tesis";

const client = es();
const INDEX = process.env.TESIS_INDEX || "tesis";
const SCROLL_TTL = "1m";
const PAGE_SIZE = 15;

export class TesisRepository {
  static initialSearch(query: QueryDslQueryContainer) {
    return client.search<Tesis>({
      index: INDEX,
      scroll: SCROLL_TTL,
      size: PAGE_SIZE,
      body: {
        query,
        _source: true,
      },
    });
  }

  static scroll(scrollId: string) {
    return client.scroll<Tesis>({
      scroll_id: scrollId,
      scroll: SCROLL_TTL,
    });
  }

  static clearScroll(scrollId: string) {
    return client.clearScroll({ scroll_id: scrollId });
  }
}
