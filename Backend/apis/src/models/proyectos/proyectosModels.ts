import { es } from "@database/elastic";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  autores: string[];
  correo_contacto: string;
  telefono_contacto: string;
  area_desarrollo: string;
  videos?: string[];
}

export interface ProyectoResult {
  proyectos: Proyecto[];
  total: number;
}

export async function getProyectos() {
  const response = await es().search({
    index: "proyectos",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  const result: ProyectoResult = {
    proyectos: response.hits.hits.map((hit: any) => hit._source),
    total: (response.hits.total as { value: number }).value,
  };
  return result;
}

export async function GetProyectosModel() {
  const response = await es().search({
    index: "proyectos",
    size: 20,
    query: { match_all: {} },
    _source: true,
  });

  const result: ProyectoResult = {
    proyectos: response.hits.hits.map((hit) => hit._source as Proyecto),
    total: (response.hits.total as { value: number }).value,
  };

  return result;
}

export async function searchProyectos(searchTerm: string) {
  const should: any[] = [
    // 🔹 Búsqueda exacta
    {
      multi_match: {
        query: searchTerm,
        type: "phrase",
        fields: ["titulo", "profesores", "area_desarrollo"],
        analyzer: "spanish", // Ignora stop words
      },
    },
    // 🔹 Búsqueda con fuzziness
    {
      multi_match: {
        query: searchTerm,
        fields: ["titulo", "profesores", "area_desarrollo"],
        fuzziness: "AUTO",
        prefix_length: 1,
        analyzer: "spanish",
      },
    },
  ];
  const body = {
    index: "proyectos",
    size: 10,
    body: {
      query: {
        bool: {
          should,
          minimum_should_match: 1,
        },
      },
      _source: true,
    },
  };
  const response = await es().search(body);
  const result: ProyectoResult = {
    proyectos: response.hits.hits.map((hit: any) => hit._source),
    total: (response.hits.total as { value: number }).value,
  };
  return result;
}

export async function searchProyectoValidYear(term: number) {
  const should: any[] = [
    {
      multi_match: {
        query: `${term}`,
        type: "phrase",
        fields: ["titulo", "profesores", "area_desarrollo"],
        analyzer: "spanish", // Ignora stop words
      },
    },
    // 🔹 Búsqueda con fuzziness
    {
      multi_match: {
        query: `${term}`,
        fields: ["titulo", "profesores", "area_desarrollo"],
        fuzziness: "AUTO",
        prefix_length: 1,
        analyzer: "spanish",
      },
    },
    {
      range: {
        created_at: {
          gte: `${term}-01-01`,
          lt: `${term + 1}-01-01`,
        },
      },
    },
  ];

  const body = {
    index: "proyectos",
    size: 10,
    body: {
      query: {
        bool: {
          should,
          minimum_should_match: 1,
        },
      },
      _source: true,
    },
  };
  const response = await es().search(body);
  const result: ProyectoResult = {
    proyectos: response.hits.hits.map((hit: any) => hit._source),
    total: (response.hits.total as { value: number }).value,
  };
  return result;
}

export async function createProyectoModel(formData: FormData) {
  try {
    const indexName = "proyectos";
    const exists = await es().indices.exists({ index: indexName });

    if (!exists) {
      await es().indices.create({
        index: indexName,
        mappings: {
          properties: {
            id: { type: "keyword" },
            titulo: { type: "text" },
            descripcion: { type: "text" },
            autores: { type: "keyword" },
            fecha_publicacion: { type: "date" },
            telefono_contacto: { type: "keyword" },
            correo_contacto: { type: "keyword" },
            area_desarrollo: { type: "keyword" },
            videos: { type: "keyword" },
          },
        },
      });
    }

    // Obtener campos del formulario
    const titulo = formData.get("titulo") as string;
    const descripcion =
      (formData.get("descripcion") as string) || "Sin descripción disponible.";
    const autores = (formData.getAll("autor") as string[]) || ["Anónimo"];
    const fecha_publicacion = new Date().toISOString();
    const telefono_contacto =
      (formData.get("telefono_contacto") as string) || "";
    const correo_contacto = (formData.get("correo_contacto") as string) || "";
    const area_desarrollo =
      (formData.get("area_desarrollo") as string) || "general";
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
      autores,
      fecha_publicacion,
      telefono_contacto,
      correo_contacto,
      area_desarrollo,
      videos: videoUrls,
    };

    const response = await es().index({
      index: indexName,
      id: nuevoProyecto.id,
      document: nuevoProyecto,
    });

    console.log("Nuevo proyecto creado:", nuevoProyecto);
    return response;
  } catch (error) {
    console.error("Error al crear el índice de proyectos:", error);
    throw error;
  }
}

export async function DeleteProyectoModel(id: string) {
  if (!id) throw new Error("Debe proporcionar un ID válido");

  // Obtener el proyecto
  const proyectoRes = await es().get({ index: "proyectos", id });
  const proyecto = proyectoRes._source as { videos?: string[] } | undefined;

  // Borrar los videos si existen
  if (proyecto?.videos && proyecto.videos.length > 0) {
    for (const videoPath of proyecto.videos) {
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
    index: "proyectos",
    id,
  });

  return response;
}

export async function PutProyectoModel(id: string, formData: FormData) {
  try {
    const indexName = "proyectos";

    // Obtener el documento actual
    const res = await es().get({ index: indexName, id });
    const proyectoActual = res._source as Partial<Proyecto> | undefined;

    if (!proyectoActual) throw new Error("Proyecto no encontrado");

    // Mantener los videos actuales
    let videoUrls: string[] = Array.isArray(proyectoActual.videos)
      ? [...proyectoActual.videos]
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
    const updateDoc: Partial<Proyecto> = {};

    // Campos simples
    [
      "titulo",
      "descripcion",
      "correo_contacto",
      "telefono_contacto",
      "area_desarrollo",
    ].forEach((key) => {
      const value = formData.get(key);
      if (typeof value === "string" && value.trim() !== "") {
        updateDoc[key as keyof Proyecto] = value as any;
      }
    });

    // Manejo especial de autores (varios valores)
    const autores = formData
      .getAll("autor")
      .filter((a) => typeof a === "string" && a.trim() !== "") as string[];
    if (autores.length > 0) {
      updateDoc.autores = autores; // ✅ ahora es string[]
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

    console.log("✅ Proyecto actualizado correctamente:", id);
  } catch (error) {
    console.error("❌ Error al actualizar proyecto:", error);
    throw error;
  }
}
