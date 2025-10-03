
import {GetPracticas, GetPracticasByYear,SearchTermPracticas} from "@/models/practicas/practicasModel";
import { PracticasResult} from "@/models/practicas/practicasModel";


export async function listPracticas(year: string | false,indice: number, type: string): Promise<PracticasResult> {
    let practicasData: PracticasResult;
    if (year) {
        practicasData = await GetPracticasByYear(indice, type, year);   
    } else {
        practicasData = await GetPracticas(indice, type);
    }   

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}

export async function BuscarPracticas(term: string, type: string): Promise<PracticasResult>{
    const practicasData: PracticasResult = await SearchTermPracticas(term, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;

}
    