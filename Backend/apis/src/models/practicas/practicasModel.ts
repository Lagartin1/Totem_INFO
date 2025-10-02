
import {es}from "@/database/elastic";


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
