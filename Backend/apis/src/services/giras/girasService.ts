// Importaciones de utilidades para manejo de archivos (MOVIDO DEL ANTIGUO MODELO)
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Importaciones de las funciones del nuevo modelo de Prisma
import {
  GiraResult,
  Gira,
  GetGiras,
  GetGiraByID,
  CreateGira,
  DeleteGira,
  UpdateGira,
  SearchGiras,
} from "@/models/giras/girasModel";

const PAGE_SIZE = 10;

// Añadimos 'indice' para soportar paginación
export async function listGiras(indice: number = 0): Promise<GiraResult> {
  // Usamos el nuevo GetGiras del modelo de Prisma
  const response = await GetGiras(indice, PAGE_SIZE);
  // Si no hay giras, devolvemos una respuesta válida con array vacío
  if (!response) {
    return { giras: [], total: 0 };
  }
  return response;
}

// Adaptamos GetGirasServices como un listado paginado también
export async function GetGirasServices(pagina?: string): Promise<GiraResult> {
  // Calculamos el índice de inicio ('skip' en Prisma)
  const pageNumber = Number(pagina) > 1 ? Number(pagina) : 1;
  const indice = (pageNumber - 1) * PAGE_SIZE;
  console.log(`Fetching giras for page ${pageNumber}, skip index ${indice}`);

  // Usamos un size de 20 para replicar el comportamiento original de GetGirasModel
  const giras = await GetGiras(indice, 6);

  // Si no hay giras, devolvemos una respuesta válida con array vacío
  if (!giras) {
    return { giras: [], total: 0 };
  }
  return giras;
}

// Se añade una función de búsqueda para consistencia con otros módulos
export async function BuscarGiras(
  term: string,
  indice: number = 0
): Promise<GiraResult> {
  const response = await SearchGiras(term, indice, PAGE_SIZE);
  // Si no hay resultados, devolvemos una respuesta válida con array vacío
  if (!response) {
    return { giras: [], total: 0 };
  }
  return response;
}

// AÑADIDO: 'autorId' es obligatorio por el esquema de Prisma.
export async function createGiraService(
  formData: FormData,
  autorId: string
): Promise<Gira> {
  try {
    // Lógica de manejo de archivos movida del antiguo modelo
    const titulo = formData.get("titulo") as string;
    const descripcion =
      (formData.get("descripcion") as string) || "Sin descripción disponible.";
    const anio =
      (formData.get("anio") as string) || new Date().getFullYear().toString();
    const lugares = formData.get("lugares") as string;
    const lugaresArray = lugares 
      ? lugares.split(",").map(lugar => lugar.trim()).filter(lugar => lugar !== "")
      : [];
    const portadaFile = formData.get("portada");
    const videosRaw = formData.getAll("videos") as (string | File)[];
    const imagenesRaw = formData.getAll("imagenes") as (string | File)[];

    let videoUrls: string[] = [];
    for (const video of videosRaw) {
      if (video instanceof File && video.size > 0) {
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${video.name}`;
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          fileName
        );
        await writeFile(filePath, buffer);
        videoUrls.push(`/uploads/${fileName}`);
      } else if (typeof video === "string" && video.startsWith("http")) {
        videoUrls.push(video);
      }
    }

    let portadaUrl: string | null = null;

    if (portadaFile instanceof File && portadaFile.size > 0) {
      const bytes = await portadaFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${randomUUID()}_${portadaFile.name}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      portadaUrl = `/uploads/${fileName}`;
    } else if (
      typeof portadaFile === "string" &&
      portadaFile.startsWith("http")
    ) {
      portadaUrl = portadaFile;
    }

    let imagenUrls: string[] = [];

    // Lógica de manejo de imagen(es) (archivo(s) o URL(s))
    for (const img of imagenesRaw) {
      if (img instanceof File && img.size > 0) {
        const bytes = await img.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${img.name}`;
        const filePath = path.join(process.cwd(), "public", "uploads", fileName);
        await writeFile(filePath, buffer);
        imagenUrls.push(`/uploads/${fileName}`);
      } else if (typeof img === "string" && img.startsWith("http")) {
        imagenUrls.push(img);
      }
    }
    const nuevaGira = await CreateGira({
      titulo,
      descripcion,
      anio,
      lugares: lugaresArray,
      portada: portadaUrl,
      videos: videoUrls,
      imagenes: imagenUrls,
      autorId: autorId, // Campo requerido por Prisma
    });

    return nuevaGira;
  } catch (error) {
    console.error("❌ Error al crear la gira:", error);
    throw error;
  }
}

// --- ACTUALIZACIÓN ---

export async function PutGirasService(
  id: string,
  formData: FormData
): Promise<Gira> {
  if (!id) throw new Error("Falta el ID de la gira");

  // Lógica de verificación de datos
  let hasData = false;
  for (const _ of formData.entries()) {
    hasData = true;
    break;
  }
  if (!hasData) throw new Error("No se recibieron datos para actualizar");

  try {
    // 1. Obtener gira actual para gestionar multimedia
    const giraActual = await GetGiraByID(id);
    if (!giraActual) throw new Error("Gira no encontrada");

    let videoUrls: string[] = Array.isArray(giraActual.videos)
      ? [...giraActual.videos]
      : [];

    let imagenUrls: string[] = Array.isArray(giraActual.imagenes)
      ? [...giraActual.imagenes]
      : [];

    let portadaUrl: string | null = giraActual.portada || null;

    // 2. Manejar videos existentes
    const videosExistentes = formData.getAll("videosExistentes");
    if (videosExistentes.length > 0) {
      videoUrls = videosExistentes.filter(
        (video) => typeof video === "string" && video.trim() !== ""
      ) as string[];
    }

    // 3. Manejar imágenes existentes
    const imagenesExistentes = formData.getAll("imagenesExistentes");
    if (imagenesExistentes.length > 0) {
      imagenUrls = imagenesExistentes.filter(
        (imagen) => typeof imagen === "string" && imagen.trim() !== ""
      ) as string[];
    }

    // 4. Manejar portada existente
    const portadaExistente = formData.get("portadaExistente");
    if (portadaExistente && typeof portadaExistente === "string") {
      portadaUrl = portadaExistente;
    }

    // 4. Eliminar videos si se indica
    if (formData.get("eliminarVideos") === "true") {
      for (const url of videoUrls) {
        if (url.startsWith("/uploads/")) {
          const oldPath = path.join(process.cwd(), "public", url);
          await unlink(oldPath).catch(() => {});
        }
      }
      videoUrls = [];
    }

    // 5. Eliminar imágenes si se indica
    if (formData.get("eliminarImagenes") === "true") {
      for (const url of imagenUrls) {
        if (url.startsWith("/uploads/")) {
          const oldPath = path.join(process.cwd(), "public", url);
          await unlink(oldPath).catch(() => {});
        }
      }
      imagenUrls = [];
    }

    // 6. Eliminar portada si se indica
    if (formData.get("eliminarPortada") === "true") {
      if (portadaUrl && portadaUrl.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), "public", portadaUrl);
        await unlink(oldPath).catch(() => {});
      }
      portadaUrl = null;
    }

    // 6. Subir/añadir nuevos videos
    const nuevosVideos = formData.getAll("videos");
    for (const video of nuevosVideos) {
      if (video instanceof File && video.size > 0) {
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${video.name}`;
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          fileName
        );
        await writeFile(filePath, buffer);
        videoUrls.push(`/uploads/${fileName}`);
      } else if (typeof video === "string" && video.startsWith("http")) {
        videoUrls.push(video);
      }
    }

    // 7. Subir/añadir nuevas imágenes
    const nuevasImagenes = formData.getAll("imagenes");
    for (const imagen of nuevasImagenes) {
      if (imagen instanceof File && imagen.size > 0) {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${randomUUID()}_${imagen.name}`;
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          fileName
        );
        await writeFile(filePath, buffer);
        imagenUrls.push(`/uploads/${fileName}`);
      } else if (typeof imagen === "string" && imagen.startsWith("http")) {
        imagenUrls.push(imagen);
      }
    }

    // 8. Subir/cambiar nueva portada
    const nuevaPortada = formData.get("portada");
    // Si no se envió la clave 'portada', forzar null
    if (nuevaPortada === null) {
      portadaUrl = null;
    }
    if (nuevaPortada instanceof File && nuevaPortada.size > 0) {
      // Eliminar portada anterior si existe
      if (portadaUrl && portadaUrl.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), "public", portadaUrl);
        await unlink(oldPath).catch(() => {});
      }
      
      // Subir nueva portada
      const bytes = await nuevaPortada.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${randomUUID()}_${nuevaPortada.name}`;
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        fileName
      );
      await writeFile(filePath, buffer);
      portadaUrl = `/uploads/${fileName}`;
    } else if (typeof nuevaPortada === "string" && nuevaPortada.startsWith("http")) {
      portadaUrl = nuevaPortada;
    }

    // 8. Construir objeto de actualización
    const updateDoc: Partial<Gira> & { videos: string[]; imagenes: string[]; lugares?: string[]; portada?: string | null } =
      { videos: videoUrls, imagenes: imagenUrls, portada: portadaUrl };

    ["titulo", "descripcion", "anio"].forEach((key) => {
      const value = formData.get(key);
      if (typeof value === "string" && value.trim() !== "") {
        (updateDoc as any)[key] = value;
      }
    });

    // Manejo especial de lugares (array)
    const lugaresForm = formData.getAll("lugares[]");
    if (lugaresForm.length === 0) {
      // Si no vienen como array, intentar como string separado por comas
      const lugaresString = formData.get("lugares") as string;
      if (lugaresString) {
        const lugaresArray = lugaresString.split(",").map(lugar => lugar.trim()).filter(lugar => lugar !== "");
        if (lugaresArray.length > 0) {
          updateDoc.lugares = lugaresArray;
        }
      }
    } else {
      const lugaresArray = lugaresForm.filter((a) => typeof a === "string" && a.trim() !== "") as string[];
      if (lugaresArray.length > 0) {
        updateDoc.lugares = lugaresArray;
      }
    }

    // 9. Llamar a la función de actualización de Prisma
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

    // Borrar videos
    if (gira?.videos && gira.videos.length > 0) {
      for (const videoPath of gira.videos) {
        if (videoPath.startsWith("/uploads/")) {
          // Borrar solo archivos locales
          const fullPath = path.join(process.cwd(), "public", videoPath);
          await unlink(fullPath).catch((err) => {
            console.warn(
              `⚠️ No se pudo borrar el video o no existe: ${videoPath}`,
              err
            );
          });
        }
      }
    }

    // Borrar imágenes
    if (gira?.imagenes && gira.imagenes.length > 0) {
      for (const imagenPath of gira.imagenes) {
        if (imagenPath.startsWith("/uploads/")) {
          // Borrar solo archivos locales
          const fullPath = path.join(process.cwd(), "public", imagenPath);
          await unlink(fullPath).catch((err) => {
            console.warn(
              `⚠️ No se pudo borrar la imagen o no existe: ${imagenPath}`,
              err
            );
          });
        }
      }
    }

    // Borrar imagen de portada
    if (gira?.portada && gira.portada.startsWith("/uploads/")) {
      const fullPath = path.join(process.cwd(), "public", gira.portada);
      await unlink(fullPath).catch((err) => {
        console.warn(
          `⚠️ No se pudo borrar la imagen de portada o no existe: ${gira.portada}`,
          err
        );
      });
    }

    // 2. Borrar de la base de datos de MongoDB con Prisma
    const result = await DeleteGira(id);
    return result;
  } catch (error) {
    console.error("Error al eliminar la gira:", error);
    throw error;
  }
}
