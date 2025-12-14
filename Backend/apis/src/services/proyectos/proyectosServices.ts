// Importaciones de utilidades para manejo de archivos (MOVIDO DEL ANTIGUO MODELO)
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Importaciones de las funciones del nuevo modelo de Prisma
import {
    ProyectoResult,
    Proyecto,
    GetProyectos,
    GetProyectoByID,
    SearchProyectos,
    SearchProyectoValidYear,
    CreateProyecto,
    DeleteProyecto,
    UpdateProyecto,
} from "@/models/proyectos/proyectosModels"; 

const PAGE_SIZE = 10;

// --- LECTURA Y BÚSQUEDA ---

export async function searchProyectosService(
    searchTerm: string,
    indice: number = 0
): Promise<ProyectoResult> {
    let response: ProyectoResult;
    const yearPattern = /^\d{4}$/;
    
    // Convertimos el searchTerm a número para validar el año
    const searchYear = parseInt(searchTerm);
    
    // Verificamos si el término es un año válido
    const isYear = yearPattern.test(searchTerm) && searchYear >= 1900 && searchYear <= new Date().getFullYear();
    
    if (isYear) {
        // Buscamos por año
        // Nota: El modelo busca proyectos CREADOS en ese año.
        response = await SearchProyectoValidYear(searchYear, indice, PAGE_SIZE);
    } else {
        // Búsqueda normal por término de texto
        response = await SearchProyectos(searchTerm, indice, PAGE_SIZE);
    }

    if (!response || response.proyectos.length === 0) {
        throw new Error("No se encontraron proyectos");
    }
    return response;
}

// Añadimos 'indice' para paginación
export async function listProyectos(indice: number = 0): Promise<ProyectoResult> {
    const response = await GetProyectos(indice, PAGE_SIZE);
    if (!response || response.proyectos.length === 0) {
        throw new Error("No se encontraron proyectos");
    }
    return response;
}

// ELIMINADA: GetProyectosServices - Es redundante con listProyectos()


// --- CREACIÓN ---

// AÑADIDO: 'autorId' es obligatorio por el esquema de Prisma.
export async function createProyectoService(formData: FormData, autorId: string): Promise<Proyecto> {
    try {
        // Lógica de manejo de archivos movida del antiguo modelo
        const titulo = formData.get("titulo") as string;
        const descripcion = (formData.get("descripcion") as string) || "Sin descripción disponible.";
        const autores = formData.getAll("autores").filter(a => typeof a === "string" && a.trim() !== "") as string[];
        const telefono_contacto = (formData.get("telefono_contacto") as string) || "";
        const correo_contacto = (formData.get("correo_contacto") as string) || "";
        const area_desarrollo = (formData.get("area_desarrollo") as string) || "general";
        const videosRaw = formData.getAll("videos") as (string | File)[];
        const portadaRaw = formData.get("portada") as File | string | null;
        const imagenesRaw = formData.getAll("imagenes") as (string | File)[];
        const fecha_publicacion = new Date();

        let videoUrls: string[] = [];
        let portadaUrl: string | undefined = undefined;
        let imagenesUrls: string[] = [];

        // Procesar portada
        if (portadaRaw) {
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
        }

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

        // Llamamos a la función de creación de Prisma con datos limpios
        const nuevoProyecto = await CreateProyecto({
            titulo,
            descripcion,
            autores,
            fecha_publicacion,
            telefono_contacto,
            correo_contacto,
            area_desarrollo,
            videos: videoUrls,
            portada: portadaUrl,
            imagenes: imagenesUrls,
            autorId // Campo requerido por Prisma
        });

        return nuevoProyecto;

    } catch (error) {
        console.error("❌ Error al crear el proyecto:", error);
        throw error;
    }
}


// --- ELIMINACIÓN ---

export async function DeleteProyectoService(id: string): Promise<any> {
    if (!id) throw new Error("Falta el ID del proyecto");

    try {
        // 1. Obtener el proyecto para borrar los archivos asociados (Lógica de archivo movida al Service)
        const proyecto = await GetProyectoByID(id);

        if (proyecto?.videos && proyecto.videos.length > 0) {
            for (const videoPath of proyecto.videos) {
                if (videoPath.startsWith('/uploads/')) { // Borrar solo archivos locales
                    const fullPath = path.join(process.cwd(), "public", videoPath);
                    await unlink(fullPath).catch((err) => {
                        console.warn(`⚠️ No se pudo borrar el video o no existe: ${videoPath}`, err);
                    });
                }
            }
        }

        // 2. Borrar de la base de datos de MongoDB con Prisma
        const result = await DeleteProyecto(id);
        return result;

    } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        throw error;
    }
}


// --- ACTUALIZACIÓN ---

export async function PutProyectosService(id: string, formData: FormData): Promise<Proyecto> {
    if (!id) throw new Error("Falta el ID del proyecto");

    // Lógica de verificación de datos
    let hasData = false;
    for (const _ of formData.entries()) {
        hasData = true;
        break;
    }
    if (!hasData) throw new Error("No se recibieron datos para actualizar");

    try {
        // 1. Obtener proyecto actual para gestionar archivos
        const proyectoActual = await GetProyectoByID(id);
        if (!proyectoActual) throw new Error("Proyecto no encontrado");

        let videoUrls: string[] = proyectoActual.videos || [];
        let portadaUrl: string | undefined = proyectoActual.portada;
        let imagenesUrls: string[] = proyectoActual.imagenes || [];

        // 2. Eliminar videos existentes si se indica
        if (formData.get("eliminarVideos") === "true") {
             for (const url of videoUrls) {
                if (url.startsWith('/uploads/')) { // Borrar solo archivos locales
                    const oldPath = path.join(process.cwd(), "public", url);
                    await unlink(oldPath).catch(() => {});
                }
            }
            videoUrls = [];
        }

        // 3. Eliminar portada existente si se indica
        if (formData.get("eliminarPortada") === "true") {
            if (portadaUrl && portadaUrl.startsWith('/uploads/')) {
                const oldPath = path.join(process.cwd(), "public", portadaUrl);
                await unlink(oldPath).catch(() => {});
            }
            portadaUrl = undefined;
        }

        // 4. Eliminar imágenes existentes si se indica
        if (formData.get("eliminarImagenes") === "true") {
            for (const url of imagenesUrls) {
                if (url.startsWith('/uploads/')) {
                    const oldPath = path.join(process.cwd(), "public", url);
                    await unlink(oldPath).catch(() => {});
                }
            }
            imagenesUrls = [];
        }

        // 5. Subir/añadir nueva portada
        const nuevaPortada = formData.get("portada") as File | string | null;
        if (nuevaPortada) {
            if (nuevaPortada instanceof File && nuevaPortada.size > 0) {
                const bytes = await nuevaPortada.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${randomUUID()}_${nuevaPortada.name}`;
                const filePath = path.join(process.cwd(), "public", "uploads", fileName);
                await writeFile(filePath, buffer);
                portadaUrl = `/uploads/${fileName}`;
            } else if (typeof nuevaPortada === "string" && nuevaPortada.startsWith("http")) {
                portadaUrl = nuevaPortada;
            }
        }

        // 6. Subir/añadir nuevos videos
        const nuevosVideos = formData.getAll("videos") as (string | File)[];
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

        // 7. Subir/añadir nuevas imágenes
        const nuevasImagenes = formData.getAll("imagenes") as (string | File)[];
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

        // 8. Construir objeto de actualización
        // Nota: usamos 'any' para autores aquí para evitar conflictos de tipo con la definición de Proyecto
        // (por ejemplo si Proyecto declara un tipo incompatible como 'string & string[]').
        const updateDoc: Partial<Proyecto> & { videos: string[], imagenes: string[], autores?: any } = { 
            videos: videoUrls,
            imagenes: imagenesUrls,
            portada: portadaUrl
        };

        // Mapeo de campos simples
        ["titulo", "descripcion", "correo_contacto", "telefono_contacto", "area_desarrollo"].forEach((key) => {
            const value = formData.get(key);
            if (typeof value === "string" && value.trim() !== "") {
                (updateDoc as any)[key] = value;
            }
        });
        
        // Manejo de autores (array)
        const autoresForm = formData.getAll("autores").filter(a => typeof a === "string" && a.trim() !== "") as string[];
        if (autoresForm.length > 0) {
            updateDoc.autores = autoresForm;
        }

        // 9. Llamar a la función de actualización de Prisma
        const result = await UpdateProyecto(id, updateDoc);
        return result;

    } catch (error) {
        console.error("❌ Error al actualizar proyecto:", error);
        throw error;
    }
}