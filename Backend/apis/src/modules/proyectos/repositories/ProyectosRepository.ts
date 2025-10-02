import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { es } from "@database/elastic";
import { Proyecto } from "../models/Proyecto";

const client = es();
const INDEX = process.env.PROYCTS_INDEX || "proyects";

export class ProyectosRepository {
  static search(query: QueryDslQueryContainer, size = 10) {
    return client.search<Proyecto>({
      index: INDEX,
      size,
      body: {
        query,
        _source: true,
      },
    });
  }
}
