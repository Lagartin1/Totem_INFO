import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es();
const INDEX = process.env.TESIS_INDEX || "tesis";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = (searchParams.get("q") || "").trim();

    let query: any;

    if (!searchTerm) {
      query = { match_all: {} };
    } else {
      const year = Number(searchTerm);
      const should: any[] = [
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
            analyzer: "spanish", // 🔹 Ignora stop words
          },
        },
      ];

      // 🔹 Si el término es un año válido
      if (!isNaN(year) && year > 1900 && year < 2100) {
        should.push({
          range: {
            created_at: {
              gte: `${year}-01-01`,
              lt: `${year + 1}-01-01`,
            },
          },
        });
      }

      query = { bool: { should, minimum_should_match: 1 } };
    }

    // Búsqueda con scroll
    const initialResponse = await client.search({
      index: INDEX,
      scroll: "1m",
      size: 15,
      body: { query, _source: true },
    });

    let hits = initialResponse.hits.hits.map((hit: any) => hit._source);
    const total = (initialResponse.hits.total as { value: number }).value;
    let scrollId = initialResponse._scroll_id;

    // Traer los siguientes lotes
    while (true) {
      const scrollResponse = await client.scroll({
        scroll_id: scrollId,
        scroll: "1m",
      });

      if (scrollResponse.hits.hits.length === 0) break;

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
