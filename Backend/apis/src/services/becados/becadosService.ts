import {
  BecadosResult,
  GetBecados,
  SearchBecado,
  SearchBecadoYear,
  createBecadoModel,
  GetBecadosModel,
  DeleteBecadoModel,
  PutBecadoModel,
  DeleteIndiceBecados,
} from "@/models/becados/becadosModel";

export async function listBecados(): Promise<BecadosResult> {
  const becadosData: BecadosResult = await GetBecados();
  if (!becadosData) {
    throw new Error("No se encontraron becados");
  }
  return becadosData;
}

export async function BuscarBecados(term: string): Promise<BecadosResult> {
  let becadosData: BecadosResult;
  const yearPattern = /^\d{4}$/;
  const year =
    yearPattern.test(term) &&
    parseInt(term) >= 1900 &&
    parseInt(term) <= new Date().getFullYear()
      ? term
      : null;
  if (year) {
    becadosData = await SearchBecadoYear(term, parseInt(year));
  } else {
    becadosData = await SearchBecado(term);
  }
  if (!becadosData) {
    throw new Error("No se encontraron becados");
  }
  return becadosData;
}

export async function createBecadoService(formData: FormData) {
  {
    try {
      const response = await createBecadoModel(formData);
      return response;
    } catch (error) {
      console.error("❌ Error al crear el becado:", error);
      throw error;
    }
  }
}

export async function GetBecadosServices() {
  const becados = await GetBecadosModel();
  if (!becados) {
    throw new Error("No se pudieron cargar los becados");
  }
  return becados;
}

export async function DeleteBecadoService(id: string) {
  if (!id) throw new Error("Falta el ID del becado");

  const result = await DeleteBecadoModel(id);
  return result;
}

export async function PutBecadoService(id: string, formData: FormData) {
  if (!id) throw new Error("Falta el ID del becado");

  // ✅ Verificar que FormData tenga al menos un campo
  let hasData = false;
  for (const _ of formData.entries()) {
    hasData = true;
    break;
  }

  if (!hasData) throw new Error("No se recibieron datos para actualizar");

  const result = await PutBecadoModel(id, formData);
  return result;
}

export async function deleteBecadoIndiceService() {
  const result = await DeleteIndiceBecados();
  return result;
}

