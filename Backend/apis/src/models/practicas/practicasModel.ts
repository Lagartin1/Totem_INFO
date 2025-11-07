
import {es} from "@/database/elastic";


export interface Practica {
    id: string;
    titulo: string;
    [key: string]: string;
}

export interface PracticasResult {
    practicas: Practica[];
    total: number;
};



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


export async function CreateBulkPracticas(dataArray: any[], lastID: number): Promise<PracticasResult[]> {
    const practicasResults: PracticasResult[] = [];

    for (const data of dataArray) {
        lastID += 1;
        const practicaData = {
            id: lastID.toString(),
            ...data
        };

        await es().index({
            index: 'practicas',
            id: practicaData.id,
            body: practicaData
        });

        practicasResults.push({
            practicas: [practicaData],
            total: 1
        });
    }

    return practicasResults;
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