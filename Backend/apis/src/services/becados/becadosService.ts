import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Importaciones de las funciones del nuevo modelo de Prisma
import {BecadosResult,Becado, GetBecados,SearchBecado,SearchBecadoYear,GetBecadoByID, CreateBecado, DeleteBecado, UpdateBecado, } from "@/models/becados/becadosModel";

const PAGE_SIZE = 10;

// Añadimos el parámetro 'indice' para la paginación
export async function listBecados(indice: number = 0): Promise<BecadosResult> {
  // Usamos el nuevo GetBecados del modelo de Prisma
  const becadosData: BecadosResult = await GetBecados(indice, PAGE_SIZE);
  if (!becadosData || becadosData.becados.length === 0) {
    throw new Error("No se encontraron becados");
  }
  return becadosData;
}

// Añadimos el parámetro 'indice' para la paginación de búsqueda
export async function BuscarBecados(term: string, indice: number = 0): Promise<BecadosResult> {
  const yearPattern = /^\d{4}$/;
  const year =
    yearPattern.test(term) &&
    parseInt(term) >= 1900 &&
    parseInt(term) <= new Date().getFullYear()
      ? parseInt(term)
      : null;

  let becadosData: BecadosResult;
  
  // Usamos las nuevas funciones del modelo
  if (year) {
    // Si se encontró el año, llamamos a la función de búsqueda por año
    becadosData = await SearchBecadoYear(term, year, indice, PAGE_SIZE);
  } else {
    // Si no es año, llamamos a la búsqueda normal por término
    becadosData = await SearchBecado(term, indice, PAGE_SIZE);
  }

  if (!becadosData || becadosData.becados.length === 0) {
    throw new Error("No se encontraron becados");
  }
  return becadosData;
}

// --- CREACIÓN ---

// Añadimos 'autorId' porque es requerido por el modelo de Prisma
export async function createBecadoService(formData: FormData, autorId: string): Promise<Becado> {
  try {
    // Lógica de manejo de archivos movida del antiguo modelo de ES
    const nombre = formData.get("nombre") as string;
    const titulo = formData.get("titulo") as string;
    const descripcion = (formData.get("descripcion") as string) || "Sin descripción disponible.";
    const videosRaw = formData.getAll("videos") || [];
    const fecha_publicacion = new Date();

    let videoUrls: string[] = [];

    for (const video of videosRaw) {
      if (video instanceof File && video.size > 0) {
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${video.name}`;
        const filePath = path.join(process.cwd(), "public", "uploads", fileName);
        await writeFile(filePath, buffer);
        videoUrls.push(`/uploads/${fileName}`);
      } else if (typeof video === "string" && video.startsWith("http")) {
        videoUrls.push(video);
      }
    }

    // Llamamos a la función de creación de Prisma con datos limpios
    const nuevoBecado = await CreateBecado({
        nombre,
        titulo,
        descripcion,
        fecha_publicacion,
        videos: videoUrls,
        autorId // Campo requerido por Prisma
    });
    
    return nuevoBecado;

  } catch (error) {
    console.error("❌ Error al crear el becado:", error);
    throw error;
  }
}

// --- LECTURA COMPLETA (Adaptación de GetBecadosServices) ---

// Cambiamos el nombre para que no sea redundante con listBecados
export async function GetBecadosServices(indice: number = 0) {
  // Usamos la función del modelo con paginación
  const becados = await GetBecados(indice, 20); // Usamos size 20 por defecto, como el modelo anterior
  if (!becados || becados.becados.length === 0) {
    throw new Error("No se pudieron cargar los becados");
  }
  return becados;
}


// --- ACTUALIZACIÓN ---

export async function PutBecadoService(id: string, formData: FormData): Promise<Becado> {
    if (!id) throw new Error("Falta el ID del becado");
    
    // Verificación básica de datos
    let hasData = false;
    for (const _ of formData.entries()) {
        hasData = true;
        break;
    }
    if (!hasData) throw new Error("No se recibieron datos para actualizar");

    try {
        // 1. Obtener becado actual y mantener la lógica de manejo de archivos
        const becadoActual = await GetBecadoByID(id);
        if (!becadoActual) throw new Error("Becado no encontrado");
        
        let videoUrls: string[] = Array.isArray(becadoActual.videos)
            ? [...becadoActual.videos]
            : [];

        // 2. Eliminar videos existentes si se indica
        if (formData.get("eliminarVideos") === "true" && videoUrls.length > 0) {
            for (const url of videoUrls) {
                if (url.startsWith('/uploads/')) { // Borrar solo archivos locales
                    const oldPath = path.join(process.cwd(), "public", url);
                    await unlink(oldPath).catch(() => {});
                }
            }
            videoUrls = [];
        }

        // 3. Subir/añadir nuevos videos
        const nuevosVideos = formData.getAll("videos");
        for (const video of nuevosVideos) {
            if (video instanceof File && video.size > 0) {
                const bytes = await video.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${randomUUID()}_${video.name}`;
                const filePath = path.join(process.cwd(), "public", "uploads", fileName);
                await writeFile(filePath, buffer);
                videoUrls.push(`/uploads/${fileName}`);
            } else if (typeof video === "string" && video.startsWith("http")) {
                videoUrls.push(video);
            }
        }

        // 4. Construir objeto de actualización (sin FormData)
        const updateDoc: Partial<Becado> & { videos: string[] } = { videos: videoUrls };

        ["nombre", "titulo", "descripcion"].forEach((key) => {
            const value = formData.get(key);
            if (typeof value === "string" && value.trim() !== "") {
                (updateDoc as any)[key] = value;
            }
        });

        // 5. Llamar a la función de actualización de Prisma
        const result = await UpdateBecado(id, updateDoc);
        return result;

    } catch (error) {
        console.error("❌ Error al actualizar becado:", error);
        throw error;
    }
}


// --- ELIMINACIÓN ---

export async function DeleteBecadoService(id: string): Promise<any> {
  if (!id) throw new Error("Falta el ID del becado");

  try {
    // 1. Obtener el becado para borrar los archivos asociados (Lógica de archivo movida al Service)
    const becado = await GetBecadoByID(id);

    if (becado?.videos && becado.videos.length > 0) {
      for (const videoPath of becado.videos) {
          if (videoPath.startsWith('/uploads/')) { // Borrar solo archivos locales
            const fullPath = path.join(process.cwd(), "public", videoPath);
            await unlink(fullPath).catch((err) => {
                console.warn(`⚠️ No se pudo borrar el video o no existe: ${videoPath}`, err);
            });
          }
      }
    }

    // 2. Borrar de la base de datos de MongoDB con Prisma
    const result = await DeleteBecado(id);
    return result;

  } catch (error) {
    console.error("Error al eliminar becado:", error);
    throw error;
  }
}

// ELIMINADA: deleteBecadoIndiceService - Ya no es necesaria.