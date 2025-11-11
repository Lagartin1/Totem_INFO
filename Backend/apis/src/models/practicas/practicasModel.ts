import { es } from "@/database/elastic";

// --- INTERFACES ---

interface TermsBucket {
  key: string;
  doc_count: number;
}

/**
 * Interfaz unificada para Practica.
 * ¡ESTA ES LA CORRECCIÓN!
 */
export interface Practica {
<<<<<<< HEAD
  id: string;
  titulo?: string; // Título o labores
  labores?: string; // Aseguramos que ambos existan
  visitas?: number; // 1. Añadimos 'visitas' como número opcional
  
  // ... (otros campos conocidos)
  tipo_practica?: string;
  created_at?: string;
  state?: boolean;
  nombre_empresa?: string;
  sede_practica?: string;
  requisitos_especiales?: string;
  
  // 2. Esto permite que 'visitas' (number) y otros campos (string) coexistan
  [key: string]: any; 
=======
    id: string;
    titulo: string;
    [key: string]: string | number;
>>>>>>> 0da3ec6 (cambios para que funcione en el server)
}

export interface PracticasResult {
  practicas: Practica[];
  total: number;
}

export interface PracticaCSV {
  total: number;
}

const FIELDS_PRACTICAS: string[] = [
  "labores",
  "titulo",
  "nombre_empresa",
  "sede_practica",
  "requisitos_especiales",
  "modalidad",
  "beneficios",
];

// --- FUNCIONES CRUD Y DE BÚSQUEDA ---

/**
 * 1. LISTAR PRÁCTICAS (PAGINADO)
 * (Función de tu captura, corregida)
 */
export async function GetPracticas(
  tipo_practica: string,
  indice: number = 0, 
  size: number = 10
): Promise<PracticasResult> {
  const body = {
    index: 'practicas',
    from: indice,
    size: size,
    body: {
      query: { 
        match: {
          tipo_practica: tipo_practica
        }
      },
      _source: true
    }
  };
  const response = await es().search(body);

  const hits: Practica[] = response.hits.hits.map((hit) => ({
    ...(hit._source as Practica),
    id: hit._id
  }));

  return {
    practicas: hits,
    total: (response.hits.total as { value: number }).value,
  };
}

/**
 * 2. BUSCAR PRÁCTICAS POR TÉRMINO (PAGINADO)
 * (Corregido)
 */
export async function SearchTermPracticas(
  term: string,
  tipo_practica: string,
  indice: number = 0,
  size: number = 10
): Promise<PracticasResult> {
  const body = {
    index: "practicas",
    from: indice,
    size: size,
    body: {
      query: {
        bool: {
          must: [
            { term: { "tipo_practica.keyword": `${tipo_practica}` } },
            {
              multi_match: {
                query: term,
                fields: FIELDS_PRACTICAS,
                fuzziness: "AUTO"
              }
            }
          ]
        }
      },
      _source: true,
    },
  };

  const response = await es().search(body);
  
  // --- CORRECCIÓN AQUÍ ---
  const hits: Practica[] = response.hits.hits.map((hit) => {
    const id = hit._id;
    if (!id) return null;
    return {
      ...(hit._source as Practica),
      id: id
    };
  }).filter(Boolean) as Practica[];

  return {
    practicas: hits,
    total: (response.hits.total as { value: number }).value,
  };
}


export async function GetPracticasByYear(
  tipo_practica: string, 
  año: string,
  indice: number = 0, 
  size: number = 10
): Promise<PracticasResult> {
  const body = {
    index: 'practicas',
    from: indice,
    size: size,
    body: {
      query: {
        bool: {
          must: [
            { term: { "tipo_practica.keyword": `${tipo_practica}` } },
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
  
  // --- CORRECCIÓN AQUÍ ---
  const hits: Practica[] = response.hits.hits.map((hit) => {
    const id = hit._id;
    if (!id) return null;
    return {
      ...(hit._source as Practica),
      id: id
    };
  }).filter(Boolean) as Practica[];

  const result: PracticasResult = {
    practicas: hits,
    total: (response.hits.total as { value: number; relation: string }).value,
  };
  return result ;
}

/**
 * 4. OBTENER ÚLTIMO ID
 */
export async function GetLastPracticaId(): Promise<number> {
  const body = {
    index: 'practicas',
    size: 1,
    body: {
      query: { match_all: {} },
      sort: [
        { "id": { "order": "desc", "numeric_type": "long" } }
      ],
      _source: ["id"]
    }
  };

  try {
    const response = await es().search(body);
    if (response.hits.hits.length === 0) {
      return 0;
    }
    const hit = response.hits.hits[0];
    const lastId = parseInt((hit._source as Practica).id, 10);
    return lastId;
  } catch (e) {
    console.error("Error GetLastPracticaId (¿'id' no es numérico?):", e);
    return 99999;
  }
}

/**
 * 5. CREAR NUEVA PRÁCTICA
 */
export async function CreateNewPractica(data: any, lastID: number): Promise<PracticasResult> {
  const newID = lastID + 1;
  const practicaData: Practica = {
    id: newID.toString(),
    state: true,
    visitas: 0,
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

/**
 * 6. CREAR PRÁCTICAS EN LOTE (BULK)
 */
export async function CreateBulkPracticas(dataArray: any[], lastID: number): Promise<PracticaCSV> {
  if (!dataArray || dataArray.length === 0) {
    return { total: 0 };
  }

  const bulkBody: any[] = [];
  let currentID = lastID;
  const now = new Date().toISOString();

  for (const data of dataArray) {
    currentID += 1;
    const practicaData: Practica = {
      id: currentID.toString(),
      state: true,
      visitas: 0,
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

  let successCount = 0;
  if (response && Array.isArray(response.items)) {
    for (const item of response.items) {
      const op = item.index || item.create || item.update || item.delete;
      if (op && !op.error) successCount += 1;
    }
  }

  return { total: successCount };
}

/**
 * 7. OBTENER PRÁCTICA POR ID
 */
export async function GetPracticasByID(id: string): Promise<PracticasResult> {
  const body = {
    index: 'practicas',
    id: id,
    _source: true
  };

  const response = await es().get(body);
  const result: PracticasResult = {
    practicas: [{ ...(response._source as Practica), id: response._id }],
    total: 1
  };
  return result;
}

/**
 * 8. ELIMINAR PRÁCTICA
 */
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

/**
 * 9. DESACTIVAR PRÁCTICA
 */
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

/**
 * 10. INCREMENTAR VISITAS
 */
export async function incrementPracticasVisits(id: string): Promise<void> {
  try {
    await es().update({
      index: "practicas",
      id: id,
      body: {
        script: {
          source: "ctx._source.visitas = (ctx._source.visitas ?: 0) + 1",
          lang: "painless"
        }
      }
    });
  } catch (error) {
    console.error(`Error incrementando visitas para practicas ${id}:`, error);
  }
}

// --- FUNCIONES DE ESTADÍSTICAS ---

/**
 * 11. OBTENER TOP 10 HISTÓRICO (por 'visitas')
 * (Corregido)
 */
export async function getTopPracticas(limit: number = 10): Promise<PracticasResult> {
  const response = await es().search({
    index: "practicas",
    size: limit,
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
<<<<<<< HEAD
  });
=======
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
    .filter((item): item is NonNullable<typeof item> => item !== null); // Type guard más específico
    // --- FIN CORRECCIÓN 2 y 3 ---


    // Ahora 'practicasConVisitas' es un array de objetos con 'id: string'
    // y el Error 3 desaparece
    const practicasOrdenadas = practicasConVisitas.sort((a, b) => b.visitas - a.visitas);
>>>>>>> 0da3ec6 (cambios para que funcione en el server)

  // --- CORRECCIÓN AQUÍ ---
  const hits: Practica[] = response.hits.hits.map((hit) => {
    const id = hit._id;
    if (!id) return null;
    return {
      ...(hit._source as Practica),
      id: id,
      visitas: (hit._source as Practica).visitas || 0
    };
  }).filter(Boolean) as Practica[];
  
  return {
    practicas: hits,
    total: hits.length
  };
}

/**
 * 12. OBTENER TOP 10 POR RANGO DE FECHAS (por 'logs')
 */
export async function getTopPracticasByDateRange(
  startDate: string, 
  endDate: string, 
  limit: number = 10
): Promise<PracticasResult> {
  
  const logQueryBody = {
    index: 'logs', // ⚠️ REVISA: Nombre de tu índice de logs
    size: 0,
    body: {
      query: {
        bool: {
          filter: [
            { term: { action: 'view_practica' } }, // ⚠️ REVISA: Nombre de la acción
            {
              range: {
                timestamp: { // ⚠️ REVISA: Campo de fecha
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
            field: 'targetId.keyword', // ⚠️ REVISA: Campo del ID
            size: limit,
            order: { _count: 'desc' }
          }
        }
      }
    }
  };

  const logResponse = await es().search(logQueryBody);
  
  const topPracticasAgg = logResponse.aggregations?.top_practicas as { buckets: TermsBucket[] };
  const buckets = topPracticasAgg?.buckets || [];

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

  // (Corregido con la interfaz actualizada)
  const practicasConVisitas = practicasDetailsResponse.hits.hits.map((hit) => {
    const practica = hit._source as Practica;
    const id = hit._id; 
    
    if (!id) return null;
    
    return {
      ...practica,
      id: id,
      visitas: practicasVisitasMap.get(id) || 0
    };
  })
  .filter(Boolean) as Practica[];

  const practicasOrdenadas = practicasConVisitas.sort((a, b) => (b.visitas ?? 0) - (a.visitas ?? 0));

  return {
    practicas: practicasOrdenadas,
    total: practicasOrdenadas.length
  };
}