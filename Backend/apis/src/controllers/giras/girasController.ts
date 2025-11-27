import {createGiraService,DeleteGiraService,PutGirasService,GetGirasServices} from "@/services/giras/girasService";
import {GiraResult} from "@/models/giras/girasModel"; 
import { addLogEntry } from "@/models/admin/logModel"; // Para el registro de actividad

// NOTA: Se añade userID porque la creación requiere un autorId en el esquema de Prisma.
export async function createGiraController(formData: FormData, userID: string) {
  try {
    // Pasamos el userID al servicio
    const response = await createGiraService(formData, userID); 
    
    // Registro de actividad
    await addLogEntry(userID, 'create_gira', 'giras'); 

    return response;
  } catch (error) {
    console.error("❌ Error al crear la gira:", error);
    throw error;
  }
}

export async function GetGirasController(pagina?: string): Promise<GiraResult> {
  // Llamamos a la función del servicio que obtiene los datos paginados
  const girasData = await GetGirasServices(pagina); 
  
  if (!girasData) {
    throw new Error("No se pudieron obtener las giras");
  }
  return girasData;
}

// NOTA: Se añade userID para el registro de actividad
export async function DeleteGirasController(id: string, userID: string) {
  try {
    const result = await DeleteGiraService(id);
    
    // Registro de actividad
    await addLogEntry(userID, 'delete_gira', 'giras');

    return result;
  } catch (error) {
    console.error("Error al eliminar gira:", error);
    throw error;
  }
}

// NOTA: Se añade userID para el registro de actividad
export async function PutGirasController(id: string, formData: FormData, userID: string) {
  try {
    const result = await PutGirasService(id, formData);
    
    // Registro de actividad
    await addLogEntry(userID, 'update_gira', 'giras', id);

    return result;
  } catch (error) {
    console.error("Error al actualizar gira:", error);
    throw error;
  }
}