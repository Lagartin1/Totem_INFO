import { BecadosResult, GetBecados,SearchBecado,SearchBecadoYear} from "@/models/becados/becadosModel";



export async function listBecados(): Promise<BecadosResult> {
    const becadosData: BecadosResult = await GetBecados();
    if (!becadosData) {
        throw new Error('No se encontraron becados');
    }
    return becadosData;
}

export async function BuscarBecados(term: string): Promise<BecadosResult>{
    let becadosData: BecadosResult;
    const yearPattern = /^\d{4}$/;
    const year = yearPattern.test(term) && parseInt(term) >= 1900 && parseInt(term) <= new Date().getFullYear() ? term : null;
    if (year) {
        becadosData = await SearchBecadoYear(term, parseInt(year));
    } else {
        becadosData = await SearchBecado(term);
    }
    if (!becadosData) {
        throw new Error('No se encontraron becados');
    }
    return becadosData;
   
}