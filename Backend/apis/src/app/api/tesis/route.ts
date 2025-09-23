import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // Cliente Elasticsearch
const INDEX = process.env.TESIS_INDEX || "tesis";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || ""; // Parámetro q para buscar
    
    // Consulta a Elasticsearch
    console.log("Buscando:", searchTerm);
    const response = await client.search({
      index: INDEX,
      size: 10, // número de resultados
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
                  "resumen"
                ],
                fuzziness: "AUTO"
              }
            }
          : { match_all: {} },
        _source: true,
      },
    });

    // Procesar resultados
    const hits = response.hits.hits.map((hit: any) => hit._source);
    const total = (response.hits.total as { value: number }).value;

    return NextResponse.json({ tesis: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /tesis:", error);
    return NextResponse.json({ error: "Error al buscar tesis" }, { status: 500 });
  }
}
