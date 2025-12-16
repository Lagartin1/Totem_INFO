import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Importaciones de las funciones del nuevo modelo de Prisma
import {BecadosResult,Becado, GetBecados,SearchBecado,SearchBecadoYear,GetBecadoByID, CreateBecado, DeleteBecado, UpdateBecado, } from "@/models/becados/becadosModel";

const PAGE_SIZE = 6;

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
    const imagenesRaw = formData.getAll("imagenes") || [];
    const portadaRaw = formData.get("portada") as File | string | null;
    const fecha_publicacion = new Date();

    let videoUrls: string[] = [];
    let imagenesUrls: string[] = [];
    let portadaUrl: string | null = null;

    // Procesar videos
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

    // Procesar imágenes
    for (const imagen of imagenesRaw) {
      if (imagen instanceof File && imagen.size > 0) {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${imagen.name}`;
        const filePath = path.join(process.cwd(), "public", "uploads", fileName);
        await writeFile(filePath, buffer);
        imagenesUrls.push(`/uploads/${fileName}`);
      } else if (typeof imagen === "string" && imagen.startsWith("http")) {
        imagenesUrls.push(imagen);
      }
    }

    // Procesar portada
    if (portadaRaw instanceof File && portadaRaw.size > 0) {
      const bytes = await portadaRaw.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${randomUUID()}_${portadaRaw.name}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      portadaUrl = `/uploads/${fileName}`;
    } else if (typeof portadaRaw === "string" && portadaRaw.startsWith("http")) {
      portadaUrl = portadaRaw;
    }

    // Llamamos a la función de creación de Prisma con datos limpios
    const nuevoBecado = await CreateBecado({
        nombre,
        titulo,
        descripcion,
        fecha_publicacion,
        videos: videoUrls,
        imagenes: imagenesUrls,
        portada: portadaUrl,
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
        
        let imagenesUrls: string[] = Array.isArray(becadoActual.imagenes)
            ? [...becadoActual.imagenes]
            : [];
            
        let portadaUrl: string | null = becadoActual.portada || null;

        // 2. Eliminar archivos existentes si se indica
        if (formData.get("eliminarVideos") === "true" && videoUrls.length > 0) {
            for (const url of videoUrls) {
                if (url.startsWith('/uploads/')) { // Borrar solo archivos locales
                    const oldPath = path.join(process.cwd(), "public", url);
                    await unlink(oldPath).catch(() => {});
                }
            }
            videoUrls = [];
        }
        
        if (formData.get("eliminarImagenes") === "true" && imagenesUrls.length > 0) {
            for (const url of imagenesUrls) {
                if (url.startsWith('/uploads/')) { // Borrar solo archivos locales
                    const oldPath = path.join(process.cwd(), "public", url);
                    await unlink(oldPath).catch(() => {});
                }
            }
            imagenesUrls = [];
        }
        
        if (formData.get("eliminarPortada") === "true" && portadaUrl) {
            if (portadaUrl.startsWith('/uploads/')) { // Borrar solo archivos locales
                const oldPath = path.join(process.cwd(), "public", portadaUrl);
                await unlink(oldPath).catch(() => {});
            }
            portadaUrl = null;
        }

        // 3. Subir/añadir nuevos archivos
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
        
        const nuevasImagenes = formData.getAll("imagenes");
        for (const imagen of nuevasImagenes) {
            if (imagen instanceof File && imagen.size > 0) {
                const bytes = await imagen.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${randomUUID()}_${imagen.name}`;
                const filePath = path.join(process.cwd(), "public", "uploads", fileName);
                await writeFile(filePath, buffer);
                imagenesUrls.push(`/uploads/${fileName}`);
            } else if (typeof imagen === "string" && imagen.startsWith("http")) {
                imagenesUrls.push(imagen);
            }
        }
        
        const nuevaPortada = formData.get("portada");
        // Si la clave 'portada' NO fue enviada, forzamos null
        if (nuevaPortada === null) {
          portadaUrl = null;
        }
        if (nuevaPortada instanceof File && nuevaPortada.size > 0) {
            // Si hay una nueva portada, eliminar la anterior
            if (portadaUrl && portadaUrl.startsWith('/uploads/')) {
                const oldPath = path.join(process.cwd(), "public", portadaUrl);
                await unlink(oldPath).catch(() => {});
            }
            
            const bytes = await nuevaPortada.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${randomUUID()}_${nuevaPortada.name}`;
            const filePath = path.join(process.cwd(), "public", "uploads", fileName);
            await writeFile(filePath, buffer);
            portadaUrl = `/uploads/${fileName}`;
        } else if (typeof nuevaPortada === "string" && nuevaPortada.startsWith("http")) {
            portadaUrl = nuevaPortada;
        }

        // 4. Construir objeto de actualización (sin FormData)
        const updateDoc: Partial<Becado> & { videos: string[], imagenes: string[], portada: string | null } = { 
            videos: videoUrls,
            imagenes: imagenesUrls,
            portada: portadaUrl
        };

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

    // Eliminar videos
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
    
    // Eliminar imágenes
    if (becado?.imagenes && becado.imagenes.length > 0) {
      for (const imagenPath of becado.imagenes) {
          if (imagenPath.startsWith('/uploads/')) { // Borrar solo archivos locales
            const fullPath = path.join(process.cwd(), "public", imagenPath);
            await unlink(fullPath).catch((err) => {
                console.warn(`⚠️ No se pudo borrar la imagen o no existe: ${imagenPath}`, err);
            });
          }
      }
    }
    
    // Eliminar portada
    if (becado?.portada && becado.portada.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), "public", becado.portada);
      await unlink(fullPath).catch((err) => {
          console.warn(`⚠️ No se pudo borrar la portada o no existe: ${becado.portada}`, err);
      });
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