import { es } from "@database/elastic";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface Noticia {
  id: string;
  [key: string]: string;
}

export interface NoticiasResult {
  noticias: Noticia[];
  total: number;
}

export async function GetNoticias() {
  const response = await es().search({
    index: "noticias",
    size: 20,
    query: { match_all: {} },
    _source: true,
  });

  const result: NoticiasResult = {
    noticias: response.hits.hits.map((hit) => hit._source as Noticia),
    total: (response.hits.total as { value: number }).value,
  };

  return result;
}

export async function CreateNoticia(formData: FormData) {
  try {
    const indexName = "noticias";
    const exists = await es().indices.exists({ index: indexName });

    if (!exists) {
      await es().indices.create({
        index: indexName,
        mappings: {
          properties: {
            id: { type: "keyword" },
            titulo: { type: "text" },
            descripcion: { type: "text" },
            contenido: { type: "text" },
            autor: { type: "keyword" },
            fecha_publicacion: { type: "date" },
            categoria: { type: "keyword" },
            imagen: { type: "text" },
          },
        },
      });
    }

    // Obtener campos del formulario
    const titulo = formData.get("titulo") as string;
    const descripcion =
      (formData.get("descripcion") as string) || "Sin descripción disponible.";
    const contenido =
      (formData.get("contenido") as string) || "Sin contenido disponible.";
    const autor = (formData.get("autor") as string) || "Anónimo";
    const categoria = (formData.get("categoria") as string) || "general";
    const fecha_publicacion = new Date().toISOString();

    // Manejo de imagen
    let imageUrl = "";
    const imagen = formData.get("imagen");

    if (imagen instanceof File && imagen.size > 0) {
      const bytes = await imagen.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${randomUUID()}_${imagen.name}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);

      imageUrl = `/uploads/${fileName}`;
    } else if (typeof imagen === "string" && imagen.startsWith("http")) {
      imageUrl = imagen;
    }

    // Calcular ID incremental
    const last = await es().search({
      index: indexName,
      sort: [{ id: { order: "desc" } }],
      size: 1,
      _source: ["id"],
    });

    const lastId = (last.hits.hits[0]?._source as any)?.id ?? 0;
    const newId = Number(lastId) + 1;

    const nuevaNoticia = {
      id: newId.toString(),
      titulo,
      descripcion,
      contenido,
      autor,
      categoria,
      fecha_publicacion,
      imagen: imageUrl,
    };

    const response = await es().index({
      index: indexName,
      id: nuevaNoticia.id,
      document: nuevaNoticia,
    });

    console.log("✅ Noticia creada correctamente:", nuevaNoticia);
    return response;
  } catch (error: any) {
    console.error("❌ Error al crear la noticia:", error);
    throw new Error(error.message || "Error desconocido al crear la noticia");
  }
}

export async function UpdateNoticia(id: string, formData: FormData) {
  try {
    const indexName = "noticias";

    // Obtener la noticia actual
    const noticiaActualRes = await es().get({ index: indexName, id });
    const noticiaActual = noticiaActualRes._source as Partial<Noticia> | undefined;

    if (!noticiaActual) throw new Error("Noticia no encontrada");

    let imageUrl = noticiaActual.imagen || "";

    // Eliminar imagen
    if (formData.get("eliminarImagen") === "true" && imageUrl) {
      const oldPath = path.join(process.cwd(), "public", imageUrl);
      await unlink(oldPath).catch(() => {});
      imageUrl = "";
    }

    // Subir nueva imagen
    const nuevaImagen = formData.get("imagen");
    if (nuevaImagen instanceof File && nuevaImagen.size > 0) {
      // Borrar imagen anterior si existía
      if (imageUrl) {
        const oldPath = path.join(process.cwd(), "public", imageUrl);
        await unlink(oldPath).catch(() => {});
      }

      const buffer = Buffer.from(await nuevaImagen.arrayBuffer());
      const fileName = `${randomUUID()}_${nuevaImagen.name}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    // Construir objeto de actualización
    const updateDoc: Partial<Noticia> = {};
    ["titulo", "descripcion", "contenido", "autor"].forEach((key) => {
      const value = formData.get(key);
      if (typeof value === "string" && value.trim() !== "") {
        updateDoc[key as keyof Noticia] = value;
      }
    });

    // Siempre actualizar imagen (aunque esté vacía)
    updateDoc.imagen = imageUrl;

    if (Object.keys(updateDoc).length === 0) {
      throw new Error("No se recibieron datos para actualizar");
    }

    await es().update({
      index: indexName,
      id,
      doc: updateDoc,
    });

    console.log("✅ Noticia actualizada correctamente:", id);
  } catch (error) {
    console.error("❌ Error al actualizar noticia:", error);
    throw error;
  }
}

export async function DeleteNoticia(id: string) {
  if (!id) throw new Error("Debe proporcionar un ID válido");

  // Obtener la noticia
  const noticiaRes = await es().get({ index: "noticias", id });
  const noticia = noticiaRes._source as { imagen?: string } | undefined;

  // Borrar la imagen si existe
  if (noticia?.imagen) {
    const imagePath = path.join(process.cwd(), "public", noticia.imagen);
    await unlink(imagePath).catch(() => {
      console.warn("No se pudo borrar la imagen o no existe:", noticia.imagen);
    });
  }

  // Borrar el documento de Elasticsearch
  const response = await es().delete({
    index: "noticias",
    id,
  });

  return response;
}

export async function DeleteIndiceNoticias() {
  const response = await es().indices.delete({
    index: "noticias",
  });

  return response;
}
