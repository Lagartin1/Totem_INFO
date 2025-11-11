import {
  listBecados,
  BuscarBecados,
  createBecadoService,
  DeleteBecadoService,
  PutBecadoService,
  deleteBecadoIndiceService
} from "@/services/becados/becadosService";
import { BecadosResult, GetBecadosModel } from "@/models/becados/becadosModel";

export async function fetchBecados(
  searchTerm: string | false
): Promise<BecadosResult> {
  let response: BecadosResult;

  if (searchTerm) {
    response = await BuscarBecados(searchTerm);
  } else {
    response = await listBecados();
  }
  if (!response) {
    throw new Error("No se encontraron becados");
  }
  return response;
}

export async function createBecadoController(formData: FormData) {
  try {
    const response = await createBecadoService(formData);
    return response;
  } catch (error) {
    console.error("❌ Error al crear el becado:", error);
    throw error;
  }
}

export async function GetBecadosController() {
  const becadosData = await GetBecadosModel();
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

export async function DeleteIndiceBecados() {
  try {
    const result = await deleteBecadoIndiceService();
    return result;
  } catch (error) {
    console.error("Error al eliminar índice:", error);
    throw error;
  }
}
