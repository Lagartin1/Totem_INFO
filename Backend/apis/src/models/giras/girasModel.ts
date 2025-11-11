import { es } from "@database/elastic";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface Gira {
  id: string;
  titulo: string;
  descripcion: string;
  anio: string;
  lugares: string[];
  videos: string[];
}

export interface GiraResult {
  giras: Gira[];
  total: number;
}

export async function getGiras() {
  const response = await es().search({
    index: "giras",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  const result: GiraResult = {
    giras: response.hits.hits.map((hit: any) => hit._source),
    total: (response.hits.total as { value: number }).value,
  };
  return result;
}

export async function GetGirasModel() {
  const response = await es().search({
    index: "giras",
    size: 20,
    query: { match_all: {} },
    _source: true,
  });

  const result: GiraResult = {
    giras: response.hits.hits.map((hit) => hit._source as Gira),
    total: (response.hits.total as { value: number }).value,
  };

  return result;
}

export async function createGiraModel(formData: FormData) {
  try {
    const indexName = "giras";
    const exists = await es().indices.exists({ index: indexName });

    if (!exists) {
      await es().indices.create({
        index: indexName,
        mappings: {
          properties: {
            id: { type: "keyword" },
            titulo: { type: "text" },
            descripcion: { type: "text" },
            lugares: { type: "keyword" },
            videos: { type: "keyword" },
          },
        },
      });
    }

    // Obtener campos del formulario
    const titulo = formData.get("titulo") as string;
    const descripcion =
      (formData.get("descripcion") as string) || "Sin descripción disponible.";
    const lugares = (formData.getAll("lugares") as string[]) || [
      "No se ingresaron lugares",
    ];
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

    const nuevoProyecto = {
      id: newId.toString(),
      titulo,
      descripcion,
      lugares,
      videos: videoUrls,
    };

    const response = await es().index({
      index: indexName,
      id: nuevoProyecto.id,
      document: nuevoProyecto,
    });

    console.log("Nueva gira creada:", nuevoProyecto);
    return response;
  } catch (error) {
    console.error("Error al crear el índice de giras:", error);
    throw error;
  }
}

export async function DeleteGiraModel(id: string) {
  if (!id) throw new Error("Debe proporcionar un ID válido");

  // Obtener la gira
  const giraRes = await es().get({ index: "giras", id });
  const gira = giraRes._source as { videos?: string[] } | undefined;

  // Borrar los videos si existen
  if (gira?.videos && gira.videos.length > 0) {
    for (const videoPath of gira.videos) {
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
    index: "giras",
    id,
  });

  return response;
}

export async function PutGiraModel(id: string, formData: FormData) {
  try {
    const indexName = "giras";

    // Obtener el documento actual
    const res = await es().get({ index: indexName, id });
    const giraActual = res._source as Partial<Gira> | undefined;

    if (!giraActual) throw new Error("Gira no encontrada");

    // Mantener los videos actuales
    let videoUrls: string[] = Array.isArray(giraActual.videos)
      ? [...giraActual.videos]
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
    const updateDoc: Partial<Gira> = {};

    // Campos simples
    [
      "titulo",
      "descripcion",
      "area_desarrollo",
      "anio",
    ].forEach((key) => {
      const value = formData.get(key);
      if (typeof value === "string" && value.trim() !== "") {
        updateDoc[key as keyof Gira] = value as any;
      }
    });

    // Manejo especial de lugares (varios valores)
    const lugares = formData
      .getAll("autor")
      .filter((a) => typeof a === "string" && a.trim() !== "") as string[];
    if (lugares.length > 0) {
      updateDoc.lugares = lugares;
    }

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

    console.log("✅ Gira actualizada correctamente:", id);
  } catch (error) {
    console.error("❌ Error al actualizar la gira:", error);
    throw error;
  }
}
