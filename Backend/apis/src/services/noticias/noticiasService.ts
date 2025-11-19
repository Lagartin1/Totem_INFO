// Importaciones de utilidades para manejo de archivos (MOVIDO DEL ANTIGUO MODELO)
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Importaciones de las funciones del nuevo modelo de Prisma
import {
  NoticiaResult,
  Noticia, 
  GetNoticias,
  GetNoticiaByID, // Nuevo, esencial para update/delete
  CreateNoticia,  // Reemplaza CreateNoticia (antiguo)
  UpdateNoticia,  // Reemplaza UpdateNoticia (antiguo)
  DeleteNoticia,  // Reemplaza DeleteNoticia (antiguo)
  // SearchNoticias, // Se puede añadir si es necesario en el futuro
} from "@/models/noticias/noticiasModels"; 

const PAGE_SIZE = 10;

// --- LECTURA ---

// Añadimos 'indice' para paginación
export async function fetchNoticias(indice: number = 0): Promise<NoticiaResult> {
  const noticias = await GetNoticias(indice, PAGE_SIZE);
  if (!noticias || noticias.noticias.length === 0) {
    throw new Error("No se pudieron cargar las noticias");
  }
  return noticias;
}

// --- CREACIÓN ---

// Añadido: 'autorId' es obligatorio por el esquema de Prisma.
export async function createNoticiaService(formData: FormData, autorId: string): Promise<Noticia> {
    const titulo = formData.get("titulo") as string;
    const contenido = formData.get("contenido") as string;
    const resumen = (formData.get("resumen") as string) || '';
    const categoria = (formData.get("categoria") as string) || 'General';
    const imagenRaw = formData.get("imagen"); 
    const fecha_publicacion = new Date(); // Usamos la fecha de creación

    if (!titulo || !contenido) {
      throw new Error("Faltan campos obligatorios: título o contenido");
    }
    
    let imagenUrl: string | undefined;

    // Lógica de manejo de imagen (archivo o URL)
    if (imagenRaw instanceof File && imagenRaw.size > 0) {
      const bytes = await imagenRaw.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${randomUUID()}_${imagenRaw.name}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      imagenUrl = `/uploads/${fileName}`;
    } else if (typeof imagenRaw === "string" && imagenRaw.startsWith("http")) {
      imagenUrl = imagenRaw;
    }

    // Llamamos a la función de creación de Prisma con datos limpios
    const result = await CreateNoticia({
      titulo,
      contenido,
      resumen,
      categoria,
      imagen: imagenUrl, // Se mapea a imagenUrl
      fecha_publicacion,
      autorId: autorId // Campo requerido por Prisma
    });

    return result;
}


// --- ACTUALIZACIÓN ---

export async function updateNoticiaService(id: string, formData: FormData): Promise<Noticia> {
  if (!id) throw new Error("Falta el ID de la noticia");

  // Verificar que FormData tenga al menos un campo
  let hasData = false;
  for (const _ of formData.entries()) {
    hasData = true;
    break;
  }
  if (!hasData) throw new Error("No se recibieron datos para actualizar");

  try {
    // 1. Obtener noticia actual para gestionar la imagen
    const noticiaActual = await GetNoticiaByID(id);
    if (!noticiaActual) throw new Error("Noticia no encontrada");

    let imagenUrl: string | null = noticiaActual.imagen || null;
    const imagenRaw = formData.get("imagen");
    const eliminarImagen = formData.get("eliminarImagen") === "true";

    // 2. Gestionar la eliminación o reemplazo de la imagen
    if (eliminarImagen && imagenUrl && imagenUrl.startsWith('/uploads/')) {
        await unlink(path.join(process.cwd(), "public", imagenUrl)).catch(() => {});
        imagenUrl = null;
    }
    
    // 3. Subir o reemplazar la imagen
    if (imagenRaw instanceof File && imagenRaw.size > 0) {
        // Borrar imagen vieja local antes de subir la nueva
        if (imagenUrl && imagenUrl.startsWith('/uploads/')) {
             await unlink(path.join(process.cwd(), "public", imagenUrl)).catch(() => {});
        }
        
        const bytes = await imagenRaw.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${imagenRaw.name}`;
        const filePath = path.join(process.cwd(), "public", "uploads", fileName);
        await writeFile(filePath, buffer);
        imagenUrl = `/uploads/${fileName}`;
        
    } else if (typeof imagenRaw === "string" && imagenRaw.startsWith("http")) {
        // Si es una URL, la guardamos, y borramos la imagen local anterior si existía
        if (imagenUrl && imagenUrl.startsWith('/uploads/')) {
             await unlink(path.join(process.cwd(), "public", imagenUrl)).catch(() => {});
        }
        imagenUrl = imagenRaw;
    }
    
    // 4. Construir objeto de actualización
    const updateDoc: Partial<Noticia> = {
        imagen: imagenUrl
    };
    
    ["titulo", "contenido", "resumen", "categoria"].forEach((key) => {
        const value = formData.get(key);
        if (typeof value === "string" && value.trim() !== "") {
            (updateDoc as any)[key] = value;
        }
    });

    // 5. Llamar a la función de actualización de Prisma
    const result = await UpdateNoticia(id, updateDoc);
    return result;

  } catch (error) {
    console.error("❌ Error al actualizar la noticia:", error);
    throw error;
  }
}

// --- ELIMINACIÓN ---

export async function deleteNoticiaService(id: string) {
  if (!id) throw new Error("Falta el ID de la noticia");

  try {
    // 1. Obtener noticia para borrar la imagen asociada
    const noticia = await GetNoticiaByID(id);

    if (noticia?.imagen && noticia.imagen.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), "public", noticia.imagen);
      await unlink(fullPath).catch((err) => {
          console.warn(`⚠️ No se pudo borrar la imagen o no existe: ${noticia.imagen}`, err);
      });
    }

    // 2. Borrar de la base de datos de MongoDB con Prisma
    const result = await DeleteNoticia(id);
    return result;

  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    throw error;
  }
}

// ELIMINADA: deleteNoticiaIndiceService (Elasticsearch específico)