import { es } from "@/database/elastic";

interface TermsBucket {
  key: string;
  doc_count: number;
}

export interface Tesis {
  id: string;
  titulo: string;
  autor: string;
  año: string;
  carrera: string;
  visitas?: number;
  [key: string]: any;
}

export interface TesisResults {
  tesis: Tesis[];
  total: number;
}

// --- Obtener tesis por año ---
export async function GetTesisByYear(indice: number, año: string | false){
  const body = {
    index: "tesis",
    from: indice,
    size: 10,
    body: {
      query: {
        range: {
          created_at: {
            gte: `${año}-01-01`,
            lte: `${año}-12-31`,
          },
        },
      },
      _source: true,
    },
  };

  const response = await es().search(body);
  const result: TesisResults = {
    tesis: response.hits.hits.map((hit) => hit._source as Tesis),
    total: (response.hits.total as { value: number }).value,
  };
  return result ;
}

// --- Listar tesis (paginado) ---
/**
 * 1. LISTAR TESIS (PAGINADO)
 * Esta es la versión correcta de tu 'GetTesis'.
 * Acepta 'indice' como un número (por defecto 0).
 */
export async function listarTesis(
  indice: number = 0,
  size: number = 10
): Promise<TesisResults> {
  const body = {
    index: "tesis",
    from: indice, // <-- Ahora 'indice' es un número
    size: size,
    body: {
      query: { match_all: {} },
      _source: true,
    },
  };

  const response = await es().search(body);
  const hits: Tesis[] = response.hits.hits.map((hit: any) => ({
    ...(hit._source as Tesis),
    id: hit._id,
  }));
  
  return {
    tesis: hits,
    total: (response.hits.total as { value: number }).value,
  };
}


// --- Crear nueva tesis ---
export async function CreateNewTesis(data: any, lastID: number): Promise<TesisResults> {
  const newID = lastID + 1;
  const tesisData = {
    id: newID.toString(),
    state: true,
    visitas: 0,
    created_at: new Date().toISOString(),
    ...data,
  };

  await es().index({
    index: "tesis",
    id: tesisData.id,
    body: tesisData,
  });

  return {
    tesis: [tesisData],
    total: 1,
  };
}

// --- Obtener tesis por ID ---
export async function GetTesisByID(id: string): Promise<TesisResults> {
  const body = {
    index: "tesis",
    id,
    _source: true,
  };

  const response = await es().get(body);
  return {
    tesis: [response._source as Tesis],
    total: 1,
  };
}

// --- Eliminar tesis ---
export async function DeleteTesisByID(id: string): Promise<boolean> {
  try {
    await es().delete({
      index: "tesis",
      id,
    });
    return true;
  } catch (error) {
    console.error("Error eliminando tesis:", error);
    return false;
  }
}

export async function incrementTesisVisits(id: string): Promise<void> {
  try {
    await es().update({
      index: "tesis",
      id: id,
      body: {
        script: {
          source: "ctx._source.visitas = (ctx._source.visitas ?: 0) + 1",
          lang: "painless"
        }
      }
    });
  } catch (error) {
    console.error(`Error incrementando visitas para tesis ${id}:`, error);
  }
}

export async function getTopTesisHistorico(limit: number = 10): Promise<TesisResults> {
  const response = await es().search({
    index: "tesis",
    size: limit, // No usamos 'from', solo el 'size' para el top N
    body: {
      query: { match_all: {} },
      sort: [
        {
          _script: {
            type: "number",
            script: {
              lang: "painless",
              source: "doc.containsKey('visitas') ? doc['visitas'].value : 0"
            },
            order: "desc"
          }
        }
      ]
    }
  });

  // Formatea la respuesta para que coincida con tu interfaz TesisResults
  const hits: Tesis[] = response.hits.hits.map((hit: any) => ({
    ...(hit._source as Tesis),
    id: hit._id,
    visitas: (hit._source as Tesis).visitas || 0 // Asegura que 'visitas' sea un número
  }));
  
  return {
    tesis: hits,
    total: hits.length // El total de resultados devueltos
  };
}

export async function getTopTesisByDateRange(
  startDate: string, 
  endDate: string, 
  limit: number = 10
): Promise<TesisResults> {
  
  const logQueryBody = {
    index: 'logs',
    size: 0, 
    body: {
      query: {
        bool: {
          filter: [
            { term: { action: 'view_tesis' } }, 
            {
              range: {
                timestamp: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          ]
        }
      },
      aggs: {
        top_tesis: {
          terms: {
            // ⚠️ REVISA ESTO: ¿El campo del ID se llama 'targetId.keyword'?
            field: 'targetId.keyword',
            size: limit,
            order: { _count: 'desc' }
          }
        }
      }
    }
  };

  const logResponse = await es().search(logQueryBody);
  
  // Especificamos el tipo de 'buckets' que esperamos
  const topTesisAgg = logResponse.aggregations?.top_tesis as { buckets: TermsBucket[] };
  const buckets = topTesisAgg?.buckets || [];

  if (buckets.length === 0) {
    return { tesis: [], total: 0 };
  }

  // 1. Obtenemos los IDs y el conteo de visitas del log
  const tesisIds = buckets.map((bucket: TermsBucket) => bucket.key);
  const tesisVisitasMap = new Map<string, number>();
  buckets.forEach((bucket: TermsBucket) => {
    tesisVisitasMap.set(bucket.key, bucket.doc_count);
  });

  // 2. Buscamos los detalles de esas tesis en el índice 'tesis'
  const tesisDetailsResponse = await es().search({
    index: 'tesis',
    size: limit,
    body: {
      query: {
        ids: {
          values: tesisIds
        }
      }
    }
  });

  // 3. Fusionamos los detalles con el conteo de visitas
  const tesisConVisitas = tesisDetailsResponse.hits.hits.map((hit) => {
    const tesis = hit._source as Tesis;
    const id = hit._id; 
    
    if (!id) return null; // Comprobación de seguridad
    
    return {
      ...tesis,
      id: id,
      visitas: tesisVisitasMap.get(id) || 0 // Asignamos el conteo del log
    };
  })
  .filter(Boolean) as Tesis[]; // Filtramos cualquier nulo

  // Ordenamos por las visitas que obtuvimos del log
  const tesisOrdenadas = tesisConVisitas.sort((a, b) => b.visitas - a.visitas);

  return {
    tesis: tesisOrdenadas,
    total: tesisOrdenadas.length
  };
}