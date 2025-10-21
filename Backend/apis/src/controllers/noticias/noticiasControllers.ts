import { fetchNoticias } from "@/services/noticias/noticiasService";


export async function listarNoticias () {
    const noticiasData = await fetchNoticias();
    if (!noticiasData) {
        throw new Error("No se pudieron obtener las noticias");
    }

    return noticiasData;

}