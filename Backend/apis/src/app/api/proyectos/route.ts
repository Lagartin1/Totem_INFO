import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // Cliente Elasticsearch
const INDEX = process.env.PROYECTS_INDEX || "proyects";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || ""; // Parámetro q para buscar

    let query: any;

    if (searchTerm.trim() === "") {
      // 🔹 Caso inicial: traer todos los proyectos
      query = { match_all: {} };
    } else {
      // 🔹 Caso con búsqueda: exactitud + semejanza
      query = {
        bool: {
          should: [
            {
              multi_match: {
                query: searchTerm,
                type: "phrase",
                fields: ["titulo", "profesores", "area_desarrollo"]
              }
            },
            {
              multi_match: {
                query: searchTerm,
                fields: ["titulo", "profesores", "area_desarrollo"],
                fuzziness: "AUTO",
                prefix_length: 1
              }
            }
          ],
          minimum_should_match: 1
        }
      };
    }

    // Consulta a Elasticsearch
    const response = await client.search({
      index: INDEX,
      size: 10,
      body: { query, _source: true }
    });

    // Procesar resultados
    const hits = response.hits.hits.map((hit: any) => hit._source);
    const total = (response.hits.total as { value: number }).value;

    return NextResponse.json({ proyectos: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /proyectos:", error);
    return NextResponse.json({ error: "Error al buscar proyectos" }, { status: 500 });
  }
}
