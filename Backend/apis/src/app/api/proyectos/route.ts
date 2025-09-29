import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // Cliente Elasticsearch
const INDEX = process.env.PROYCTS_INDEX || "proyects";

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
        // 🔹 Búsqueda exacta
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["titulo", "profesores", "area_desarrollo"],
            analyzer: "spanish", // Ignora stop words
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: searchTerm,
            fields: ["titulo", "profesores", "area_desarrollo"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
      ];

      // 🔹 Si es un año válido, filtrar por created_at
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

    // Consulta a Elasticsearch
    const response = await client.search({
      index: INDEX,
      size: 10,
      body: { query, _source: true },
    });

    const hits = response.hits.hits.map((hit: any) => hit._source);
    const total = (response.hits.total as { value: number }).value;

    return NextResponse.json({ proyectos: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /proyectos:", error);
    return NextResponse.json({ error: "Error al buscar proyectos" }, { status: 500 });
  }
}
