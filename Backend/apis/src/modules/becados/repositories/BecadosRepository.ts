import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { es } from "@database/elastic";
import { Becado } from "../models/Becado";

const client = es();
const INDEX = process.env.BECADOS_INDEX || "becados";

export class BecadosRepository {
  static search(query: QueryDslQueryContainer, size = 10) {
    return client.search<Becado>({
      index: INDEX,
      size,
      body: {
        query,
        _source: true,
      },
    });
  }
}
