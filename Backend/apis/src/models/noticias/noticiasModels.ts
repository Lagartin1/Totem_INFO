import { es } from "@database/elastic";
import { writeFile } from "fs/promises";
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
    const descripcion = formData.get("descripcion") as string;
    const contenido = (formData.get("contenido") as string) || "Sin contenido disponible.";
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

export async function UpdateNoticia(id: string, data: Record<string, any>) {
  if (!id) throw new Error("Debe proporcionar un ID válido");
  if (!data) throw new Error("Datos vacíos");

  const response = await es().update({
    index: "noticias",
    id,
    doc: data,
  });

  return response;
}

export async function DeleteNoticia(id: string) {
  if (!id) throw new Error("Debe proporcionar un ID válido");

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
