import {
  createGiraService,
  DeleteGiraService,
  PutGirasService,
} from "@/services/giras/girasService";
import {
  GetGirasModel,
} from "@/models/giras/girasModel";


export async function createGiraController(formData: FormData) {
  try {
    const response = await createGiraService(formData);
    return response;
  } catch (error) {
    console.error("❌ Error al crear la gira:", error);
    throw error;
  }
}

export async function GetGirasController() {
  const girasData = await GetGirasModel();
  if (!girasData) {
    throw new Error("No se pudieron obtener las giras");
  }
  return girasData;
}

export async function DeleteGirasController(id: string) {
  try {
    const result = await DeleteGiraService(id);
    return result;
  } catch (error) {
    console.error("Error al eliminar gira:", error);
    throw error;
  }
}

export async function PutGirasController(id: string, formData: FormData) {
  try {
    const result = await PutGirasService(id, formData);
    return result;
  } catch (error) {
    console.error("Error al actualizar gira:", error);
    throw error;
  }
}
