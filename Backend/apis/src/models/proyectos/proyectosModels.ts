import {es} from "@database/elastic";


export interface Proyecto {
    titulo: string;
    descripcion: string;
    [key: string]: string; // Para otras propiedades dinámicas
}

export interface ProyectoResult {
    proyectos: Proyecto[];
    total: number;
}

export async function getProyectos() {
  const response = await es().search({
    index: "proyects",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  const result: ProyectoResult = {
    proyectos: response.hits.hits.map((hit: any) => hit._source),
    total: (response.hits.total as { value: number }).value,
  };
  return result;
}



export async function searchProyectos(searchTerm: string) {
    const should: any[] = [
        // 🔹 Búsqueda exacta
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["titulo", "profesores", "area_desarrollo"],
            analyzer: "spanish", // Ignora stop words
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: searchTerm,
            fields: ["titulo", "profesores", "area_desarrollo"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
      ];
    const body = {
        index: "proyects",
        size: 10,
        body: {
          query: {
            bool: {
              should,
              minimum_should_match: 1,
            },
          },
          _source: true,
        },
      };
    const response = await es().search(body);
    const result: ProyectoResult = {
        proyectos: response.hits.hits.map((hit: any) => hit._source),
        total: (response.hits.total as { value: number }).value,
      };
      return result;
}




export async function searchProyectoValidYear(term: number) {
    const should: any[] = [
        {
          multi_match: {
            query: `${term}`,
            type: "phrase",
            fields: ["titulo", "profesores", "area_desarrollo"],
            analyzer: "spanish", // Ignora stop words
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: `${term}`,
            fields: ["titulo", "profesores", "area_desarrollo"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
        {
            range: {
                created_at: {
                    gte: `${term}-01-01`,
                    lt: `${term + 1}-01-01`,
                },
            },
        }
      ];

    const body = {
        index: "proyects",
        size: 10,
        body: {
          query: {
            bool:{
                should,
                minimum_should_match: 1
            }
          },
          _source: true,
        },
      };
    const response = await es().search(body);
    const result: ProyectoResult = {
        proyectos: response.hits.hits.map((hit: any) => hit._source),
        total: (response.hits.total as { value: number }).value,
    };
    return result;

}