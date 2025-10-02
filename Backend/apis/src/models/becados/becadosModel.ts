import {es}from "@/database/elastic";


export interface Becado {
    id: string;
    [key: string]: string;
}

export interface BecadosResult {
    becados: Becado[];
    total: number;
}


export async function GetBecados(){
    const body = {
        index: 'becados',
        size: 10,
        body: {
            query: {
                match_all: {}
            },
            _source: true
        }
    };
    const response = await es().search(body);
    const result: BecadosResult = {
        becados: response.hits.hits.map((hit) => hit._source as Becado),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;

}


export async function SearchBecado(searchTerm: string): Promise<BecadosResult> {
    const should: any[] = [
        // 🔹 Búsqueda exacta con analyzer spanish
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["nombre", "titulo", "descripcion"],
            analyzer: "spanish",
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: searchTerm,
            fields: ["nombre", "titulo", "descripcion"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
      ];
    const body = {
        index: 'becados',
        size: 10,
        body: {
            query: {
                bool : { should, minimum_should_match: 1 }

            } ,
        }
    }
    const response = await es().search(body);
    const result: BecadosResult = {
        becados: response.hits.hits.map((hit) => hit._source as Becado),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;

}


export async function SearchBecadoYear(searchTerm: string, year: number): Promise<BecadosResult> {
    const should: any[] = [
        // 🔹 Búsqueda exacta con analyzer spanish
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["nombre", "titulo", "descripcion"],
            analyzer: "spanish",
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: searchTerm,
            fields: ["nombre", "titulo", "descripcion"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
        {
          range: {
            created_at: {
              gte: `${year}-01-01`,
              lt: `${year + 1}-01-01`,
            },
          },
        }
      ];
    const body = {
        index: 'becados',
        size: 10,
        body: {
            query: {
                bool : { should, minimum_should_match: 1 }
            } ,
        }
    }
    const response = await es().search(body);
    const result: BecadosResult = {
        becados: response.hits.hits.map((hit) => hit._source as Becado),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result;

}