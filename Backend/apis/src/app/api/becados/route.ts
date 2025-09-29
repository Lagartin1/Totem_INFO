import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es();
const INDEX = process.env.BECADOS_INDEX || "becados";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("q") || "";

    let query: any;

    if (searchTerm.trim() === "") {
      query = { match_all: {} };
    } else {
      const year = Number(searchTerm);
      const should: any[] = [
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["nombre", "titulo", "descripcion"],
          },
        },
      ];

      // 🔹 Si el término es un año válido (ej: 2023, 2024, etc.)
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

    const response = await client.search({
      index: INDEX,
      size: 10,
      body: { query, _source: true },
    });

    const hits = response.hits.hits.map((hit: any) => hit._source);
    const total = (response.hits.total as { value: number }).value;

    return NextResponse.json({ becados: hits, total }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /becados:", error);
    return NextResponse.json(
      { error: "Error al buscar becados" },
      { status: 500 }
    );
  }
}
