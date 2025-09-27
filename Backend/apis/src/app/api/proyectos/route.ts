import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";


const client = es(); // Cliente Elasticsearch
const INDEX = process.env.PROYECTS_INDEX || "proyects";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || ""; // Parámetro q para buscar
    
    // Consulta a Elasticsearch
    console.log(searchTerm);
    const response = await client.search({
      index: INDEX,
      size: 10,
      body: {
        query: {
          bool: {
            should: [
              // 1. Coincidencia exacta (frase completa, sin dividir en tokens)
              {
                multi_match: {
                  query: searchTerm,
                  type: "phrase",
                  fields: ["titulo^4", "profesores^3", "area_desarrollo", "descripcion"]
                }
              },
              // 2. Coincidencia aproximada (para semejanza)
              {
                multi_match: {
                  query: searchTerm,
                  fields: ["titulo^3", "profesores^2", "area_desarrollo", "descripcion"],
                  fuzziness: "AUTO",   // similaridad flexible
                  prefix_length: 1     // al menos 1 letra exacta antes de aplicar fuzzy
                }
              }
            ],
            minimum_should_match: 1 // debe cumplirse al menos una
          }
        },
        _source: true
      }
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
