import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // Cliente Elasticsearch
const INDEX = process.env.BECADOS_INDEX || "becados";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || ""; // Parámetro q para buscar

    let query: any;

    if (searchTerm.trim() === "") {
      // 🔹 Caso inicial: traer todos los becados
      query = { match_all: {} };
    } else {
      // 🔹 Caso con búsqueda: exactitud + semejanza
      query = {
              multi_match: {
                query: searchTerm,
                type: "phrase",
                fields: ["nombre", "titulo", "descripcion"]
              }
            }
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

    return NextResponse.json({ becados: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /becados:", error);
    return NextResponse.json({ error: "Error al buscar becados" }, { status: 500 });
  }
}
