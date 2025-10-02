import { listBecados, BuscarBecados,  } from "@/services/becados/becadosService";
import { BecadosResult} from "@/models/becados/becadosModel";

export async function fetchBecados(searchTerm: string | false): Promise<BecadosResult> {
    let response: BecadosResult;

    if (searchTerm) {
        response = await BuscarBecados(searchTerm);
    } else {
        response = await listBecados();
    }
    if (!response) {
        throw new Error('No se encontraron becados');
    }
    return response;
}
