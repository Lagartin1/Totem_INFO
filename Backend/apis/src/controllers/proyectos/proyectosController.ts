import {
  searchProyectosService,
  listProyectos,
  createProyectoService,
  DeleteProyectoService,
  PutProyectosService,
} from "@/services/proyectos/proyectosServices";
import {
  ProyectoResult,
  GetProyectosModel,
} from "@/models/proyectos/proyectosModels";

export async function proyectosController(
  searchTerm?: string
): Promise<ProyectoResult> {
  let response: ProyectoResult;

  if (searchTerm) {
    response = await searchProyectosService(searchTerm);
  } else {
    response = await listProyectos();
  }
  if (!response) {
    throw new Error("No se encontraron proyectos");
  }

  return response;
}

export async function createProyectoController(formData: FormData) {
  try {
    const response = await createProyectoService(formData);
    return response;
  } catch (error) {
    console.error("❌ Error al crear el proyecto:", error);
    throw error;
  }
}

export async function GetProyectosController() {
  const proyectosData = await GetProyectosModel();
  if (!proyectosData) {
    throw new Error("No se pudieron obtener los proyectos");
  }
  return proyectosData;
}

export async function DeleteProyectosController(id: string) {
  try {
    const result = await DeleteProyectoService(id);
    return result;
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    throw error;
  }
}

export async function PutProyectosController(id: string, formData: FormData) {
  try {
    const result = await PutProyectosService(id, formData);
    return result;
  } catch (error) {
    console.error("Error al actualizar noticia:", error);
    throw error;
  }
}
