import {listBecados,BuscarBecados,createBecadoService,DeleteBecadoService,PutBecadoService,} from "@/services/becados/becadosService";

// Importamos los tipos y funciones correctas del nuevo modelo
import { BecadosResult, GetBecados } from "@/models/becados/becadosModel"; 

export async function fetchBecados(searchTerm: string | false, indice: number = 0) {
  try {
    if (searchTerm) {
      // Si hay término de búsqueda, llamamos a la búsqueda del servicio
      return await BuscarBecados(searchTerm, indice);
    } else {
      // Si no, listamos normal usando el servicio
      return await GetBecados(indice);
    }
  } catch (error) {
    console.error("Error en el controlador fetchBecados:", error);
    throw error;
  }
}

// NOTA: Se añade userID porque Prisma requiere un autor obligatorio para crear el registro.
// Deberás actualizar la llamada a esta función en tu archivo route.ts para pasar el ID del usuario.
export async function createBecadoController(formData: FormData, userID: string) {
  try {
    const response = await createBecadoService(formData, userID);
    return response;
  } catch (error) {
    console.error("❌ Error al crear el becado:", error);
    throw error;
  }
}

export async function GetBecadosController() {
  // Usamos GetBecados del modelo refactorizado
  const becadosData = await GetBecados(); 
  if (!becadosData) {
    throw new Error("No se pudieron obtener los becados");
  }
  return becadosData;
}

export async function DeleteBecadosController(id: string) {
  try {
    const result = await DeleteBecadoService(id);
    return result;
  } catch (error) {
    console.error("Error al eliminar becado:", error);
    throw error;
  }
}

export async function PutBecadosController(id: string, formData: FormData) {
  try {
    const result = await PutBecadoService(id, formData);
    return result;
  } catch (error) {
    console.error("Error al actualizar becado:", error);
    throw error;
  }
}

