
import { GetNoticias } from "@/models/noticias/noticiasModels";



export async function fetchNoticias() {
    const noticias = await GetNoticias();
    if (!noticias) {
        throw new Error("No se pudieron cargar las noticias");
    }   
    return noticias;
}