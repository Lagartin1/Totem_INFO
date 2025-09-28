import { NextRequest, NextResponse } from "next/server";
import { es } from "@database/elastic";

const client = es(); // seteo cliente general

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params; // aquí tendrás "profesional"

  // Ejemplo: ejecutar búsqueda según el tipo
  if (type === "profesional") {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get('q') || '';
    // Si el searchTerm viene en el body como JSON
    console.log(searchTerm, type);
    const response = await client.search({
      index: 'practicas',
      size:1,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: searchTerm,
                  fields: ['labores', 'sede_practica', 'nombre_empresa', 'beneficios', 'modalidad', 'regimen_trabajo', 'requisitos_especiales'],
                  fuzziness: 'AUTO'
                }
              },
              {
                match: {
                  tipo_practica: "Profesional",
                }
              }
            ]
          }
        },
        _source: true
      }
    });

    const hits = response.hits.hits.map((hit: any) => hit._source);
    const total = response.hits.total as { value: number; relation: string };
    return NextResponse.json({ practicas: hits, total: total.value }, { status: 200 });
  }
  else if (type === "inicial") {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get('q') || '';
    console.log(searchTerm, type);
    const response = await client.search({
      index: 'practicas',
      size:1,
      body: {
      query: {
        bool: {
        must: [
          {
          multi_match: {
            query: searchTerm,
            fields: ['labores', 'sede_practica', 'nombre_empresa', 'beneficios', 'modalidad', 'regimen_trabajo', 'requisitos_especiales'],
            fuzziness: 'AUTO'
          }
          },
          {
          match: {
            tipo_practica: "Inicial",
          }
          }
        ]
        }
      },
      _source: true
      }
    });

    const hits = response.hits.hits.map((hit: any) => hit._source);
    const total = response.hits.total as { value: number; relation: string };
    return NextResponse.json({ practicas: hits, total: total.value }, { status: 200 });
  }

  return NextResponse.json({ error: "Tipo no soportado" }, { status: 400 });
}
