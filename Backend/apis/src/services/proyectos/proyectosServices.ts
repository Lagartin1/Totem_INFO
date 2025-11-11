import {
  ProyectoResult,
  searchProyectos,
  searchProyectoValidYear,
  getProyectos,
  createProyectoModel,
  GetProyectosModel,
  DeleteProyectoModel,
  PutProyectoModel,
} from "@/models/proyectos/proyectosModels"; // Asegura que las variables de entorno estén tipadas

export async function searchProyectosService(
  searchTerm: string
): Promise<ProyectoResult> {
  let response: ProyectoResult;
  const yearPattern = /^\d{4}$/;
  const year =
    yearPattern.test(searchTerm) &&
    parseInt(searchTerm) >= 1900 &&
    parseInt(searchTerm) <= new Date().getFullYear()
      ? searchTerm
      : null;
  if (year) {
    response = await searchProyectoValidYear(parseInt(searchTerm));
  } else {
    response = await searchProyectos(searchTerm);
  }
  if (!response) {
    throw new Error("No se encontraron proyectos");
  }
  return response;
}

export async function listProyectos(): Promise<ProyectoResult> {
  const response = await getProyectos();
  if (!response) {
    throw new Error("No se encontraron proyectos");
  }
  return response;
}

export async function createProyectoService(formData: FormData) {
  {
    try {
      const response = await createProyectoModel(formData);
      return response;
    } catch (error) {
      console.error("❌ Error al crear el proyecto:", error);
      throw error;
    }
  }
}

export async function GetProyectosServices() {
  const noticias = await GetProyectosModel();
  if (!noticias) {
    throw new Error("No se pudieron cargar las noticias");
  }
  return noticias;
}

export async function DeleteProyectoService(id: string) {
  if (!id) throw new Error("Falta el ID del proyecto");

  const result = await DeleteProyectoModel(id);
  return result;
}

export async function PutProyectosService(id: string, formData: FormData) {
  if (!id) throw new Error("Falta el ID del proyecto");

  // ✅ Verificar que FormData tenga al menos un campo
  let hasData = false;
  for (const _ of formData.entries()) {
    hasData = true;
    break;
  }

  if (!hasData) throw new Error("No se recibieron datos para actualizar");

  const result = await PutProyectoModel(id, formData);
  return result;
}