
import {GetPracticas, GetPracticasByYear,SearchTermPracticas} from "@/models/practicas/practicasModel";
import { PracticasResult} from "@/models/practicas/practicasModel";
import {CreateNewPractica, GetLastPracticaId,CreateBulkPracticas,GetPracticasByID} from "@/models/practicas/practicasModel";


const test = true;

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


export async function insertNewPractica(data: any): Promise<PracticasResult> {
    const lastID = await GetLastPracticaId();
    const practicasData: PracticasResult = await CreateNewPractica(data,lastID);
    if (!practicasData) {
        throw new Error('No se pudo crear la práctica');
    }
    //const review:PracticasResult= await GetPracticasByID(practicasData.practicas[0].id);
   // if (!review) {
    //    throw new Error('No se pudo obtener la práctica');
   // }
    //console.log("Review:", review);
    return practicasData;
}



export async function insertCsvPracticas(dataArray: any[]): Promise<PracticasResult[]> {
    const lastID = await GetLastPracticaId();
    const practicasDataArray: PracticasResult[] = await CreateBulkPracticas(dataArray,lastID);
    if (!practicasDataArray) {
        throw new Error('No se pudieron crear las prácticas');
    }
    return practicasDataArray;
}
