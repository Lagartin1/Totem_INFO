import {es} from "@database/elastic";
export interface Tesis {
    id: string;
    title: string;
    [key: string]: string;
}

export interface TesisResponse  {
    Tesis: Tesis[];
    total: number;
}

const FIELDS: string[] = [
              "titulo",
              "profesor",
              "area_desarrollo",
              "descripcion",
              "autor",
              "universidad",
              "facultad",
              "palabras_clave",
              "resumen",
            ]   

export async function listarTesis(index: string,): Promise<TesisResponse> {
    const body = {
        index,
        scroll: "1m",
        size: 15,
        body: {
            query: { match_all: {} },
            _source: true
        }
    };
    
    const response = await es().search(body);
    
    let hits: Tesis[] = response.hits.hits.map((hit: any) => hit._source as Tesis);
    const total = (response.hits.total as { value: number }).value;
    let scrollId = response._scroll_id;
    while (true) {
        const scrollResponse = await es().scroll({
            scroll_id: scrollId,
            scroll: "1m",
        });
        
        if (scrollResponse.hits.hits.length === 0) break;
        hits = hits.concat(scrollResponse.hits.hits.map((hit: any) => hit._source as Tesis));
        scrollId = scrollResponse._scroll_id;
    }
    await es().clearScroll({ scroll_id: scrollId });
    
    const result: TesisResponse = {
        Tesis: hits,
        total
    };
    return result;
}





export async function SearchTermTesis( index: string, searchTerm: string) {
    const body = {
        index,
        scroll: "1m",
        size:15,
        body: {
            query: {
                bool: {
                    multi_match: {
                        query: searchTerm,
                        fields: FIELDS,
                        fuzziness: "AUTO",
                        analyzer: "spanish",
                    },
                    minimum_should_match: 1
                }
            },
            _source: true
        }
    };
    
    const response = await es().search(body);

    let hits: Tesis[] = response.hits.hits.map((hit: any) => hit._source as Tesis);
    const total = (response.hits.total as { value: number }).value;
    let scrollId = response._scroll_id;

    while (true) {
        const scrollResponse = await es().scroll({
            scroll_id: scrollId,
            scroll: "1m",
        });

        if (scrollResponse.hits.hits.length === 0) break;

        hits = hits.concat(scrollResponse.hits.hits.map((hit: any) => hit._source as Tesis));
        scrollId = scrollResponse._scroll_id;
    }
    await es().clearScroll({ scroll_id: scrollId });

    const result: TesisResponse = {
        Tesis: hits,
        total
    };
    return result;
}



export async function SearchTermTesisValidYear(term: number, index: string) {
    const should = [
        {
            multi_match: {
                query: term.toString(),
                fields: FIELDS,
                fuzziness: "AUTO",
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
        },
    ];



    const body = {
        index,
        scroll: "1m",
        size: 15,
        body: {
            query: {
                bool:{
                    should,
                    minimum_should_match: 1
                }
            },
            _source: true
        }
    };
    
    const response = await es().search(body);

    let hits: Tesis[] = response.hits.hits.map((hit: any) => hit._source as Tesis);
    const total = (response.hits.total as { value: number }).value;
    let scrollId = response._scroll_id;

    while (true) {
        const scrollResponse = await es().scroll({
            scroll_id: scrollId,
            scroll: "1m",
        });
        if (scrollResponse.hits.hits.length === 0) break;

        hits = hits.concat(scrollResponse.hits.hits.map((hit: any) => hit._source as Tesis));
        scrollId = scrollResponse._scroll_id;
    }
    await es().clearScroll({ scroll_id: scrollId });

    const result: TesisResponse = {
        Tesis: hits,
        total
    };
    return result;

}




