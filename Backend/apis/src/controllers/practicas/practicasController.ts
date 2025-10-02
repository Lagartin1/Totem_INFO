import { PracticasResult} from "@/models/practicas/practicasModel";
import { listPracticas, BuscarPracticas } from "@/services/practicas/practicasService";



export async function fetchPracticas(year: string | false,indice: number, type: string): Promise<PracticasResult> {

    let practicasData: PracticasResult;

    practicasData = await listPracticas(year, indice, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}



export async function SearchTermPracticas(term: string, type: string): Promise<PracticasResult> {
    
    let practicasData: PracticasResult;
    practicasData = await BuscarPracticas(term, type);
    
    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}