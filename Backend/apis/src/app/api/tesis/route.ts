import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // Cliente Elasticsearch
const INDEX = process.env.TESIS_INDEX || "tesis";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || ""; // Parámetro q para buscar
    
    console.log("Buscando:", searchTerm);

    // Primera búsqueda con scroll
    const initialResponse = await client.search({
      index: INDEX,
      scroll: "1m", // tiempo que mantiene el contexto de búsqueda
      size: 15,     // tamaño de cada batch
      body: {
        query: searchTerm
          ? {
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
              },
            }
          : { match_all: {} },
        _source: true,
      },
    });

    let hits = initialResponse.hits.hits.map((hit: any) => hit._source);
    const total = (initialResponse.hits.total as { value: number }).value;
    let scrollId = initialResponse._scroll_id;

    // Traer los siguientes lotes con scroll
    while (true) {
      const scrollResponse = await client.scroll({
        scroll_id: scrollId,
        scroll: "1m",
      });

      if (scrollResponse.hits.hits.length === 0) break; // fin de resultados

      hits = hits.concat(scrollResponse.hits.hits.map((hit: any) => hit._source));
      scrollId = scrollResponse._scroll_id;
    }

    // Liberar recursos del scroll
    await client.clearScroll({ scroll_id: scrollId });

    return NextResponse.json({ tesis: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /tesis:", error);
    return NextResponse.json({ error: "Error al buscar tesis" }, { status: 500 });
  }
}
