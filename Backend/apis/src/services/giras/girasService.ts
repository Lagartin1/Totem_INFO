import {
  GiraResult,
  getGiras,
  createGiraModel,
  GetGirasModel,
  DeleteGiraModel,
  PutGiraModel,
} from "@/models/giras/girasModel";

export async function listGiras(): Promise<GiraResult> {
  const response = await getGiras();
  if (!response) {
    throw new Error("No se encontraron giras");
  }
  return response;
}

export async function createGiraService(formData: FormData) {
  {
    try {
      const response = await createGiraModel(formData);
      return response;
    } catch (error) {
      console.error("❌ Error al crear la gira:", error);
      throw error;
    }
  }
}

export async function GetGirasServices() {
  const giras = await GetGirasModel();
  if (!giras) {
    throw new Error("No se pudieron cargar las giras");
  }
  return giras;
}

export async function DeleteGiraService(id: string) {
  if (!id) throw new Error("Falta el ID de la gira");

  const result = await DeleteGiraModel(id);
  return result;
}

export async function PutGirasService(id: string, formData: FormData) {
  if (!id) throw new Error("Falta el ID de la gira");

  // ✅ Verificar que FormData tenga al menos un campo
  let hasData = false;
  for (const _ of formData.entries()) {
    hasData = true;
    break;
  }

  if (!hasData) throw new Error("No se recibieron datos para actualizar");

  const result = await PutGiraModel(id, formData);
  return result;
}