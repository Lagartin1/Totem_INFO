import { fetchNoticias, updateNoticiaService, createNoticiaService, deleteNoticiaService } from "@/services/noticias/noticiasService";


export async function listarNoticias () {
    const noticiasData = await fetchNoticias();
    if (!noticiasData) {
        throw new Error("No se pudieron obtener las noticias");
    }

    return noticiasData;
}

export async function actualizarNoticia(id: string, data: Record<string, any>) {
  try {
    const result = await updateNoticiaService(id, data);
    return result;
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    throw error;
  }
}

export async function crearNoticia(data: Record<string, any>) {
  try {
    const result = await createNoticiaService(data);
    return result;
  } catch (error) {
    console.error("Error al crear noticia:", error);
    throw error;
  }
}

export async function eliminarNoticia(id: string) {
  try {
    const result = await deleteNoticiaService(id);
    return result;
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    throw error;
  }
}