
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