import { listarTesis, TesisResults } from "@/models/tesis/tesisModels";

export async function listTesis(indice: number = 0, size: number = 10): Promise<TesisResults> {
  // Llama a la función del modelo con los parámetros de paginación
  const tesisData = await listarTesis(indice, size); 
  
  if (!tesisData) {
    throw new Error('No se encontraron tesis');
  }
  return tesisData;
}

