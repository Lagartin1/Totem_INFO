// pages/api/noticias.ts
import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // Cliente Elasticsearch
const INDEX = process.env.NOTICIAS_INDEX || "noticias";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || ""; // Parámetro q para buscar

    let query: any;

    if (searchTerm.trim() === "") {
      query = { match_all: {} }
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

    return NextResponse.json({ noticias: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /noticias:", error);
    return NextResponse.json({ error: "Error al buscar becados" }, { status: 500 });
  }
}