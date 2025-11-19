import {searchProyectosService,listProyectos,createProyectoService,DeleteProyectoService,PutProyectosService,} from "@/services/proyectos/proyectosServices";

import {ProyectoResult,} from "@/models/proyectos/proyectosModels"; 
import { addLogEntry } from "@/models/admin/logModel"; 

export async function proyectosController(
  searchTerm?: string,
  indice: number = 0 // <-- AÑADIDO
): Promise<ProyectoResult> {
  let response: ProyectoResult;

  if (searchTerm) {
    // Pasamos el índice de paginación a la búsqueda
    response = await searchProyectosService(searchTerm, indice);
  } else {
    // Pasamos el índice de paginación al listado
    response = await listProyectos(indice);
  }
  
  if (!response || response.proyectos.length === 0) {
    throw new Error("No se encontraron proyectos");
  }

  return response;
}

// AÑADIDO: userID para autoría y registro
export async function createProyectoController(formData: FormData, userID: string) {
  try {
    // Pasamos el userID al servicio (obligatorio por el esquema de Prisma)
    const response = await createProyectoService(formData, userID);
    
    // Registro de actividad
    await addLogEntry(userID, 'create_proyecto', 'proyectos');
    
    return response;
  } catch (error) {
    console.error("❌ Error al crear el proyecto:", error);
    throw error;
  }
}

// GetProyectosController se comporta ahora como un listado inicial no paginado (índice 0)
export async function GetProyectosController() {
  // Usamos el listado del servicio con el índice 0 por defecto
  const proyectosData = await listProyectos(0); 
  
  if (!proyectosData || proyectosData.proyectos.length === 0) {
    throw new Error("No se pudieron obtener los proyectos");
  }
  return proyectosData;
}

// AÑADIDO: userID para el registro de actividad
export async function DeleteProyectosController(id: string, userID: string) {
  try {
    const result = await DeleteProyectoService(id);
    
    // Registro de actividad
    await addLogEntry(userID, 'delete_proyecto', 'proyectos', id);
    
    return result;
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    throw error;
  }
}

// AÑADIDO: userID para el registro de actividad
export async function PutProyectosController(id: string, formData: FormData, userID: string) {
  try {
    const result = await PutProyectosService(id, formData);
    
    // Registro de actividad
    await addLogEntry(userID, 'update_proyecto', 'proyectos', id);
    
    return result;
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    throw error;
  }
}