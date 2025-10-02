import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";

export function extractHits<TDocument>(response: SearchResponse<TDocument>) {
  return response.hits.hits
    .map((hit) => hit._source)
    .filter((source): source is TDocument => Boolean(source));
}

export function extractTotal(response: SearchResponse<unknown>) {
  const { total } = response.hits;
  if (typeof total === "number") {
    return total;
  }
  return total?.value ?? 0;
}
