// Importaciones de utilidades para manejo de archivos (MOVIDO DEL ANTIGUO MODELO)
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Importaciones de las funciones del nuevo modelo de Prisma
import {GiraResult,Gira, GetGiras,        GetGiraByID,      CreateGira,       DeleteGira,       UpdateGira,       SearchGiras       } from "@/models/giras/girasModel"; 

const PAGE_SIZE = 10;

// --- LECTURA ---

// Añadimos 'indice' para soportar paginación
export async function listGiras(indice: number = 0): Promise<GiraResult> {
  // Usamos el nuevo GetGiras del modelo de Prisma
  const response = await GetGiras(indice, PAGE_SIZE);
  if (!response || response.giras.length === 0) {
    throw new Error("No se encontraron giras");
  }
  return response;
}

// Adaptamos GetGirasServices como un listado paginado también
export async function GetGirasServices(indice: number = 0) {
    // Usamos un size de 20 para replicar el comportamiento original de GetGirasModel
    const giras = await GetGiras(indice, 20); 
    if (!giras || giras.giras.length === 0) {
        throw new Error("No se pudieron cargar las giras");
    }
    return giras;
}

// Se añade una función de búsqueda para consistencia con otros módulos
export async function BuscarGiras(term: string, indice: number = 0): Promise<GiraResult> {
    const response = await SearchGiras(term, indice, PAGE_SIZE);
    if (!response || response.giras.length === 0) {
        throw new Error("No se encontraron giras con ese término");
    }
    return response;
}


// --- CREACIÓN ---

// AÑADIDO: 'autorId' es obligatorio por el esquema de Prisma.
export async function createGiraService(formData: FormData, autorId: string): Promise<Gira> {
    try {
        // Lógica de manejo de archivos movida del antiguo modelo
        const titulo = formData.get("titulo") as string;
        const descripcion = (formData.get("descripcion") as string) || "Sin descripción disponible.";
        const anio = (formData.get("anio") as string) || new Date().getFullYear().toString();
        const lugares = formData.getAll("lugares").filter(a => typeof a === "string" && a.trim() !== "") as string[];
        const videosRaw = formData.getAll("videos") as (string | File)[];

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
        const nuevaGira = await CreateGira({
            titulo,
            descripcion,
            anio,
            lugares,
            videos: videoUrls,
            autorId: autorId // Campo requerido por Prisma
        });

        return nuevaGira;

    } catch (error) {
        console.error("❌ Error al crear la gira:", error);
        throw error;
    }
}


// --- ACTUALIZACIÓN ---

export async function PutGirasService(id: string, formData: FormData): Promise<Gira> {
    if (!id) throw new Error("Falta el ID de la gira");

    // Lógica de verificación de datos
    let hasData = false;
    for (const _ of formData.entries()) {
        hasData = true;
        break;
    }
    if (!hasData) throw new Error("No se recibieron datos para actualizar");

    try {
        // 1. Obtener gira actual para gestionar videos
        const giraActual = await GetGiraByID(id);
        if (!giraActual) throw new Error("Gira no encontrada");

        let videoUrls: string[] = Array.isArray(giraActual.videos)
            ? [...giraActual.videos]
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

        // 4. Construir objeto de actualización
        const updateDoc: Partial<Gira> & { videos: string[], lugares?: string[] } = { videos: videoUrls };

        ["titulo", "descripcion", "anio"].forEach((key) => {
            const value = formData.get(key);
            if (typeof value === "string" && value.trim() !== "") {
                (updateDoc as any)[key] = value;
            }
        });
        
        // Manejo especial de lugares (array)
        const lugaresForm = formData.getAll("lugares").filter(a => typeof a === "string" && a.trim() !== "") as string[];
        if (lugaresForm.length > 0) {
            updateDoc.lugares = lugaresForm;
        }

        // 5. Llamar a la función de actualización de Prisma
        const result = await UpdateGira(id, updateDoc);
        return result;

    } catch (error) {
        console.error("❌ Error al actualizar la gira:", error);
        throw error;
    }
}

// --- ELIMINACIÓN ---

export async function DeleteGiraService(id: string): Promise<any> {
    if (!id) throw new Error("Falta el ID de la gira");

    try {
        // 1. Obtener la gira para borrar los archivos asociados
        const gira = await GetGiraByID(id);

        if (gira?.videos && gira.videos.length > 0) {
            for (const videoPath of gira.videos) {
                if (videoPath.startsWith('/uploads/')) { // Borrar solo archivos locales
                    const fullPath = path.join(process.cwd(), "public", videoPath);
                    await unlink(fullPath).catch((err) => {
                        console.warn(`⚠️ No se pudo borrar el video o no existe: ${videoPath}`, err);
                    });
                }
            }
        }

        // 2. Borrar de la base de datos de MongoDB con Prisma
        const result = await DeleteGira(id);
        return result;

    } catch (error) {
        console.error("Error al eliminar la gira:", error);
        throw error;
    }
}