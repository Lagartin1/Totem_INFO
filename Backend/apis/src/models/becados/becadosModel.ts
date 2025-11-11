import {es}from "@/database/elastic";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface Becado {
  id: string;
  nombre: string;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  videos: string[];
}

export interface BecadosResult {
    becados: Becado[];
    total: number;
}

export async function GetBecados(){
    const body = {
        index: 'becados',
        size: 10,
        body: {
            query: {
                match_all: {}
            },
            _source: true
        }
    };
    const response = await es().search(body);
    const result: BecadosResult = {
        becados: response.hits.hits.map((hit) => hit._source as Becado),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;

}
export async function SearchBecado(searchTerm: string): Promise<BecadosResult> {
    const should: any[] = [
        // 🔹 Búsqueda exacta con analyzer spanish
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["nombre", "titulo", "descripcion"],
            analyzer: "spanish",
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: searchTerm,
            fields: ["nombre", "titulo", "descripcion"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
      ];
    const body = {
        index: 'becados',
        size: 10,
        body: {
            query: {
                bool : { should, minimum_should_match: 1 }

            } ,
        }
    }
    const response = await es().search(body);
    const result: BecadosResult = {
        becados: response.hits.hits.map((hit) => hit._source as Becado),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result ;

}

export async function SearchBecadoYear(searchTerm: string, year: number): Promise<BecadosResult> {
    const should: any[] = [
        // 🔹 Búsqueda exacta con analyzer spanish
        {
          multi_match: {
            query: searchTerm,
            type: "phrase",
            fields: ["nombre", "titulo", "descripcion"],
            analyzer: "spanish",
          },
        },
        // 🔹 Búsqueda con fuzziness
        {
          multi_match: {
            query: searchTerm,
            fields: ["nombre", "titulo", "descripcion"],
            fuzziness: "AUTO",
            prefix_length: 1,
            analyzer: "spanish",
          },
        },
        {
          range: {
            created_at: {
              gte: `${year}-01-01`,
              lt: `${year + 1}-01-01`,
            },
          },
        }
      ];
    const body = {
        index: 'becados',
        size: 10,
        body: {
            query: {
                bool : { should, minimum_should_match: 1 }
            } ,
        }
    }
    const response = await es().search(body);
    const result: BecadosResult = {
        becados: response.hits.hits.map((hit) => hit._source as Becado),
        total: (response.hits.total as { value: number; relation: string }).value,
    };
    return result;

}

export async function createBecadoModel(formData: FormData) {
  try {
    const indexName = "becados";
    const exists = await es().indices.exists({ index: indexName });

    if (!exists) {
      await es().indices.create({
        index: indexName,
        mappings: {
          properties: {
            id: { type: "keyword" },
            nombre: { type: "text" },
            titulo: { type: "text" },
            descripcion: { type: "text" },
            fecha_publicacion: { type: "date" },
            videos: { type: "keyword" },
          },
        },
      });
    }

    // Obtener campos del formulario
    const nombre = formData.get("nombre") as string;
    const titulo = formData.get("titulo") as string;
    const descripcion =
    (formData.get("descripcion") as string) || "Sin descripción disponible.";
    const fecha_publicacion = new Date().toISOString();
    const videos = (formData.getAll("videos") as string[]) || [];

    let videoUrls: string[] = [];

    // Iterar sobre todos los elementos del campo "videos"
    for (const video of videos) {
      // Caso 1: es un archivo
      const v: any = video;

      if (v instanceof File && v.size > 0) {
        const bytes = await v.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${randomUUID()}_${v.name}`;
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          fileName
        );
        await writeFile(filePath, buffer);

        videoUrls.push(`/uploads/${fileName}`);
      } else if (typeof v === "string" && v.startsWith("http")) {
        videoUrls.push(v);
      }

      // Caso 2: es una URL (por ejemplo, un enlace de YouTube)
      else if (typeof video === "string" && video.startsWith("http")) {
        videoUrls.push(video);
      }
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

    const nuevoBecado = {
      id: newId.toString(),
      nombre,
      titulo,
      descripcion,
      fecha_publicacion,
      videos: videoUrls,
    };

    const response = await es().index({
      index: indexName,
      id: nuevoBecado.id,
      document: nuevoBecado,
    });

    console.log("Nuevo becado creado:", nuevoBecado);
    return response;
  } catch (error) {
    console.error("Error al crear el índice de becados:", error);
    throw error;
  }
}

export async function DeleteBecadoModel(id: string) {
  if (!id) throw new Error("Debe proporcionar un ID válido");

  // Obtener el becado
  const becadoRes = await es().get({ index: "becados", id });
  const becado = becadoRes._source as { videos?: string[] } | undefined;

  // Borrar los videos si existen
  if (becado?.videos && becado.videos.length > 0) {
    for (const videoPath of becado.videos) {
      const fullPath = path.join(process.cwd(), "public", videoPath);
      try {
        await unlink(fullPath);
        console.log(`✅ Video eliminado: ${videoPath}`);
      } catch (err) {
        console.warn(`⚠️ No se pudo borrar el video o no existe: ${videoPath}`);
      }
    }
  }

  // Borrar el documento de Elasticsearch
  const response = await es().delete({
    index: "becados",
    id,
  });

  return response;
}

export async function PutBecadoModel(id: string, formData: FormData) {
  try {
    const indexName = "becados";

    // Obtener el documento actual
    const res = await es().get({ index: indexName, id });
    const becadoActual = res._source as Partial<Becado> | undefined;

    if (!becadoActual) throw new Error("Becado no encontrado");

    // Mantener los videos actuales
    let videoUrls: string[] = Array.isArray(becadoActual.videos)
      ? [...becadoActual.videos]
      : [];

    // Eliminar videos existentes si se indica
    if (formData.get("eliminarVideos") === "true" && videoUrls.length > 0) {
      for (const url of videoUrls) {
        const oldPath = path.join(process.cwd(), "public", url);
        await unlink(oldPath).catch(() => {}); // Ignorar error si no existe
      }
      videoUrls = [];
    }

    // Subir nuevos videos
    const nuevosVideos = formData.getAll("videos");

    for (const video of nuevosVideos) {
      // 🔒 comprobamos si es un archivo subido
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
        // 🔗 si es una URL externa, la guardamos directamente
        videoUrls.push(video);
      }
    }

    // Construir objeto de actualización
    const updateDoc: Partial<Becado> = {};

    // Campos simples
    [
      "nombre",
      "titulo",
      "descripcion",
    ].forEach((key) => {
      const value = formData.get(key);
      if (typeof value === "string" && value.trim() !== "") {
        updateDoc[key as keyof Becado] = value as any;
      }
    });

    // Actualizar lista de videos (aunque esté vacía)
    updateDoc.videos = videoUrls;

    if (Object.keys(updateDoc).length === 0) {
      throw new Error("No se recibieron datos para actualizar");
    }

    // Actualizar en Elasticsearch
    await es().update({
      index: indexName,
      id,
      doc: updateDoc,
    });

    console.log("✅ Becado actualizado correctamente:", id);
  } catch (error) {
    console.error("❌ Error al actualizar becado:", error);
    throw error;
  }
}

export async function GetBecadosModel() {
  const response = await es().search({
    index: "becados",
    size: 20,
    query: { match_all: {} },
    _source: true,
  });

  const result: BecadosResult = {
    becados: response.hits.hits.map((hit) => hit._source as Becado),
    total: (response.hits.total as { value: number }).value,
  };

  return result;
}

export async function DeleteIndiceBecados() {
  const response = await es().indices.delete({
    index: "becados",
  });

  return response;
}