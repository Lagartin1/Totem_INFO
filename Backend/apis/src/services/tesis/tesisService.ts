
import { listarTesis, SearchTermTesis, SearchTermTesisValidYear,TesisResponse } from "@/models/tesis/tesisModels";

export async function listTesis(): Promise<TesisResponse> {
    const tesisData = await listarTesis("tesis");   
    if (!tesisData) {
        throw new Error('No se encontraron tesis');
    }
    return tesisData;
}

export async function SearchTerm(term: string): Promise<TesisResponse> {
    let response: TesisResponse;
    const yearPattern = /^\d{4}$/;
    const year = yearPattern.test(term) && parseInt(term) >= 1900 && parseInt(term) <= new Date().getFullYear() ? term : null;
    if (year) {
        response = await SearchTermTesisValidYear(parseInt(term), "tesis");
    } else {
        response = await SearchTermTesis("tesis", term);
    }
    if (!response) {
        throw new Error('No se encontraron tesis');
    }
    return response;

}