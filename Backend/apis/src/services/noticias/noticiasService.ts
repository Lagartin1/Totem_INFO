import {
  GetNoticias,
  UpdateNoticia,
  CreateNoticia,
  DeleteNoticia,
  DeleteIndiceNoticias,
} from "@/models/noticias/noticiasModels";

export async function fetchNoticias() {
  const noticias = await GetNoticias();
  if (!noticias) {
    throw new Error("No se pudieron cargar las noticias");
  }
  return noticias;
}

export async function updateNoticiaService(id: string, formData: FormData) {
  if (!id) throw new Error("Falta el ID de la noticia");

  // ✅ Verificar que FormData tenga al menos un campo
  let hasData = false;
  for (const _ of formData.entries()) {
    hasData = true;
    break;
  }

  if (!hasData) throw new Error("No se recibieron datos para actualizar");

  const result = await UpdateNoticia(id, formData);
  return result;
}

export async function createNoticiaService(formData: FormData) {
  const titulo = formData.get("titulo");
  const contenido = formData.get("contenido");

  if (!titulo || !contenido) {
    throw new Error("Faltan campos obligatorios: título o contenido");
  }

  const result = await CreateNoticia(formData);
  return result;
}

export async function deleteNoticiaService(id: string) {
  if (!id) throw new Error("Falta el ID de la noticia");

  const result = await DeleteNoticia(id);
  return result;
}

export async function deleteNoticiaIndiceService() {
  const result = await DeleteIndiceNoticias();
  return result;
}
