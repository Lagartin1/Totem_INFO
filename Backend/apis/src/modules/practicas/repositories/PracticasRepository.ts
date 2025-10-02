import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { es } from "@database/elastic";
import { Practica } from "../models/Practica";

const client = es();
const INDEX = process.env.PRACTICAS_INDEX || "practicas";

interface SearchParams {
  query: QueryDslQueryContainer;
  from: number;
  size: number;
}

export class PracticasRepository {
  static search({ query, from, size }: SearchParams) {
    return client.search<Practica>({
      index: INDEX,
      from,
      size,
      body: {
        query,
        _source: true,
      },
    });
  }
}
