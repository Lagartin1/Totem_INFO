import { addLogEntry } from "@/models/admin/logModel";

import {fetchNoticias,updateNoticiaService,createNoticiaService,deleteNoticiaService,} from "@/services/noticias/noticiasService";

export async function listarNoticias(indice: number = 0) {
  // Añadimos 'indice' para la paginación
  const noticiasData = await fetchNoticias(indice); 
  if (!noticiasData || noticiasData.noticias.length === 0) {
    throw new Error("No se pudieron obtener las noticias");
  }
  return noticiasData;
}

// AÑADIDO: userID para registrar la acción y establecer la autoría
export async function crearNoticia(formData: FormData, userID: string) {
  try {
    // Pasamos el userID al servicio
    const result = await createNoticiaService(formData, userID); 
    
    // Registro de actividad
    await addLogEntry(userID, 'create_noticia', 'noticia'); 
    
    return result;
  } catch (error) {
    console.error("Error al crear noticia:", error);
    throw error;
  }
}

// AÑADIDO: userID para el registro de actividad
export async function actualizarNoticia(id: string, formData: FormData, userID: string) {
  try {
    // La lógica de archivos y FormData está en el servicio
    const result = await updateNoticiaService(id, formData); 
    
    // Registro de actividad
    await addLogEntry(userID, 'update_noticia', 'noticia', id);
    
    return result;
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    throw error;
  }
}

// AÑADIDO: userID para el registro de actividad
export async function eliminarNoticia(id: string, userID: string) {
  try {
    // El servicio maneja la eliminación de archivos y de la DB
    const result = await deleteNoticiaService(id); 
    
    // Registro de actividad
    await addLogEntry(userID, 'delete_noticia', 'noticia', id);
    
    return result;
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    throw error;
  }
}
