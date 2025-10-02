import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { es } from "@database/elastic";
import { Noticia } from "../models/Noticia";

const client = es();
const INDEX = process.env.NOTICIAS_INDEX || "noticias";

export class NoticiasRepository {
  static search(query: QueryDslQueryContainer, size = 10) {
    return client.search<Noticia>({
      index: INDEX,
      size,
      body: {
        query,
        _source: true,
      },
    });
  }
}
