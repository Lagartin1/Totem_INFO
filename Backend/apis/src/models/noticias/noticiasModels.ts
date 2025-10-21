import {es} from "@database/elastic";

export interface Noticia {
    id: string;
    [key: string]: string;
}

export interface NoticiasResult {
    noticias: Noticia[];
    total: number;
}


export async function GetNoticias(){    
    const body = {
        index: 'noticias',
        size: 10,
        body: {
            query: {
                match_all: {}
            },
            _source: true
        }
    };
    const response = await es().search(body);
    const result: NoticiasResult = {
        noticias: response.hits.hits.map((hit) => hit._source as Noticia),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;

}

export async function UpdateNoticia(id: string, data: Record<string, any>) {
  const response = await es().update({
    index: "noticias",
    id,
    body: {
      doc: data, // solo actualiza los campos enviados
    },
  });
  return response;
}

export async function CreateNoticia(data: Record<string, any>) {
  if (!data) throw new Error("Datos vacíos");

  const response = await es().index({
    index: "noticias",
    body: data,
  });

  return response;
}

export async function DeleteNoticia(id: string) {
  if (!id) throw new Error("Debe proporcionar un ID válido");

  const response = await es().delete({
    index: "noticias",
    id,
  });

  return response;
}