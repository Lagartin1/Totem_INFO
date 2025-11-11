
import {es} from "@/database/elastic";

interface TermsBucket {
  key: string;
  doc_count: number;
}

export interface Practica {
    id: string;
    titulo: string;
    [key: string]: string;
}

export interface PracticasResult {
    practicas: Practica[];
    total: number;
};

export interface PracticaCSV {
    total: number;
}
    
export async function GetPracticasByYear(indice: number, tipo_practica: string, año: string | false) {
    const body = {
      index: 'practicas',
      from: indice,
      size: 10,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  tipo_practica: `${tipo_practica}`
                }
              },
              {
                range: {
                  created_at: {
                    gte: `${año}-01-01`,
                    lte: `${año}-12-31`
                  }
                }
              }
            ]
          }
        },
        _source: true
      }
    };
    const response = await es().search(body);
    const result: PracticasResult = {
        practicas: response.hits.hits.map((hit) => hit._source as Practica),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;
}


export async function GetPracticas(indice: number, tipo_practica: string) {
    const body = {
      index: 'practicas',
      from: indice,
      size: 10,
      body: {
        query: { 
            match: {
                tipo_practica: `${tipo_practica}`
            }
            },
        _source: true
        }
    };
    const response = await es().search(body);

    const result: PracticasResult = {
        practicas: response.hits.hits.map((hit) => hit._source as Practica),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;
}

export async function SearchTermPracticas(term: string, type: string,): Promise<PracticasResult> {
    const body = {
        index: 'practicas',
        size: 10,
        body: {
        query: {
          bool: {
          must: [
            {
            multi_match: {
              query: `${term}`,
              fields: ['labores', 'sede_practica', 'nombre_empresa', 'beneficios', 'modalidad', 'regimen_trabajo', 'requisitos_especiales'],
              fuzziness: 'AUTO'
            }
            },
            {
            match: {
              tipo_practica: `${type}`,
            }
            }
          ]
          }
        },
        _source: true
        }
    }

    const response = await es().search(body);

    const result: PracticasResult = {
        practicas: response.hits.hits.map((hit) => hit._source as Practica),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;
}




export async function GetLastPracticaId(): Promise<number> {
  const body = {
    index: 'practicas',
    size: 1,
    body: {
      sort: [
        { id: { order: 'desc' } }
      ],
      _source:true,
    }
  };

  const response = await es().search(body) as { hits: { hits: { _source: Practica }[] } };
  if (response.hits.hits.length === 0) {
    return 0; // No hay prácticas, empezar desde 0
  }
  const hit = response.hits.hits[0];
  const lastId = parseInt(hit._source.id, 10);
  return lastId;
}



export async function CreateNewPractica(data: any, lastID: number): Promise<PracticasResult> {
    const newID = lastID + 1;
    const practicaData = {
        id: newID.toString(),
        state: true,
        vistas: 0,
        created_at: new Date().toISOString(),
        ...data
    };

    await es().index({
        index: 'practicas',
        id: practicaData.id,
        body: practicaData

    });

    return {
        practicas: [practicaData],
        total: 1
    };
}

export async function CreateBulkPracticas(dataArray: any[], lastID: number): Promise<PracticaCSV> {
  if (!dataArray || dataArray.length === 0) {
    return { total: 0 };
  }

  const bulkBody: any[] = [];
  let currentID = lastID;
  const now = new Date().toISOString();

  for (const data of dataArray) {
    currentID += 1;
    const practicaData = {
      id: currentID.toString(),
      state: true,
      vistas: 0,
      created_at: now,
      ...data
    };

    bulkBody.push({ index: { _index: 'practicas', _id: practicaData.id } });
    bulkBody.push(practicaData);
  }

  const response: any = await es().bulk({
    refresh: true,
    body: bulkBody
  });

  // Cuenta cuántos documentos se indexaron correctamente
  let successCount = 0;
  if (response && Array.isArray(response.items)) {
    for (const item of response.items) {
      const op = item.index || item.create || item.update || item.delete;
      if (op && !op.error) successCount += 1;
    }
  }

  return { total: successCount };
}

export async function GetPracticasByID(id: string): Promise<PracticasResult> {
    const body = {
        index: 'practicas',
        id: id,
        _source: true
    };

    const response = await es().get(body);
    const result: PracticasResult = {
        practicas: [response._source as Practica],
        total: 1
    };
    return result;
}

export async function DeletePracticaByID(id: string): Promise<boolean> {
    const body = {
        index: 'practicas',
        id: id,
    };
    try {
        await es().delete(body);
        return true;
    } catch (error) {
        console.error('Error deleting practica:', error);
        return false;
    }
}


export async function desactivePracticaByID(id: string): Promise<boolean | { error: string }> {
    try {
        await es().update({
            index: 'practicas',
            id,
            body: {
                doc: {
                    state: false
                }
            }
        });
        return true;
    } catch (error) {
        console.error('Error desactivando práctica:', error);
        return { error: 'Error desactivando práctica' };
    }
}



export async function getTopPracticas(limit: number = 10): Promise<PracticasResult> {
    const body = {
        index: 'practicas',
        from: 0,
        size: limit,
        body: {
            query: {
                match_all: {} // Queremos todas las prácticas
            },
            sort: [
                { "visitas": { "order": "desc" } } 
            ],
            _source: true
        }
    };
    const response = await es().search(body);

    const result: PracticasResult = {
        practicas: response.hits.hits.map((hit) => hit._source as Practica),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result;
}



export async function incrementPracticaVisits(id: string): Promise<boolean> {
    try {
        await es().update({
            index: 'practicas',
            id: id,
            body: {
                script: {
                    // "Si 'visitas' existe, súmale 1. Si no (?: 0), ponlo en 1"
                    source: "ctx._source.visitas = (ctx._source.visitas ?: 0) + 1",
                    lang: "painless"
                }
            }
        });
        return true;
    } catch (error) {
        console.error('Error al incrementar visitas:', error);
        return false;
    }
}


export async function getTopPracticasByDateRange(
    startDate: string, 
    endDate: string, 
    limit: number = 10
): Promise<PracticasResult> {
    
    const logQueryBody = {
        index: 'logs',
        size: 0,
        body: {
            // ... (tu query, está perfecta) ...
            query: {
                bool: {
                    filter: [
                        { term: { action: 'view_practica' } },
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
                top_practicas: {
                    terms: {
                        field: 'targetId.keyword',
                        size: limit,
                        order: { _count: 'desc' }
                    }
                }
            }
        }
    };

    const logResponse = await es().search(logQueryBody);
    
    // --- CORRECCIÓN 1 (Error 'buckets') ---
    // Hacemos un "cast" a un tipo que SÍ tiene buckets
    const topPracticasAgg = logResponse.aggregations?.top_practicas as { buckets: TermsBucket[] };
    const buckets = topPracticasAgg?.buckets || [];
    // --- FIN CORRECCIÓN 1 ---

    if (buckets.length === 0) {
        return { practicas: [], total: 0 };
    }

    const practicasIds = buckets.map((bucket: TermsBucket) => bucket.key);
    const practicasVisitasMap = new Map<string, number>();
    buckets.forEach((bucket: TermsBucket) => {
        practicasVisitasMap.set(bucket.key, bucket.doc_count);
    });

    const practicasDetailsResponse = await es().search({
        index: 'practicas',
        size: limit,
        body: {
            query: {
                ids: {
                    values: practicasIds
                }
            }
        }
    });

    // --- CORRECCIÓN 2 y 3 (Error 'id | undefined') ---
    const practicasConVisitas = practicasDetailsResponse.hits.hits.map((hit) => {
        const practica = hit._source as Practica;
        const id = hit._id; 
        
        // 1. Verificamos que el ID exista
        if (!id) {
            return null;
        }
        
        // 2. Ahora 'id' es de tipo 'string', no 'undefined'
        return {
            ...practica,
            id: id,
            visitas: practicasVisitasMap.get(id) || 0
        };
    })
    // 3. Filtramos cualquier 'null' que hayamos añadido
    .filter(Boolean); // Esto elimina los nulos y convence a TypeScript
    // --- FIN CORRECCIÓN 2 y 3 ---


    // Ahora 'practicasConVisitas' es un array de objetos con 'id: string'
    // y el Error 3 desaparece
    const practicasOrdenadas = practicasConVisitas.sort((a, b) => b.visitas - a.visitas);

    return {
        practicas: practicasOrdenadas,
        total: practicasOrdenadas.length
    };
}