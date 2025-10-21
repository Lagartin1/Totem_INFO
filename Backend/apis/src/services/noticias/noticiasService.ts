import { GetNoticias, UpdateNoticia, CreateNoticia, DeleteNoticia } from "@/models/noticias/noticiasModels";

export async function fetchNoticias() {
    const noticias = await GetNoticias();
    if (!noticias) {
        throw new Error("No se pudieron cargar las noticias");
    }   
    return noticias;
}

export async function updateNoticiaService(id: string, data: Record<string, any>) {
  if (!id) {
    throw new Error("Falta el ID de la noticia");
  }
  if (!data || Object.keys(data).length === 0) {
    throw new Error("No se recibieron datos para actualizar");
  }

  const result = await UpdateNoticia(id, data);
  return result;
}

export async function createNoticiaService(data: Record<string, any>) {
  if (!data.titulo || !data.descripcion) {
    throw new Error("Faltan campos obligatorios: título o descripción");
  }

  const result = await CreateNoticia(data);
  return result;
}

export async function deleteNoticiaService(id: string) {
  if (!id) {
    throw new Error("Falta el ID de la noticia");
  }

  const result = await DeleteNoticia(id);
  return result;
}