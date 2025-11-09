import {es} from "../../database/elastic.ts"

const INDEX = process.env.WORKSHOPS_INDEX || "workshops";
const COUNTER_INDEX = process.env.COUNTER_INDEX || "workshop_counter";
const COUNTER_ID = "workshop_id_counter";


export async function getWorkshops(from: number = 0) {
  const client = es();
  const body = await client.search({
    index: INDEX,
    body: {
      from,
      size: 12,
      query: {
        match_all: {}
      },
      sort: [
        { id: { order: "asc" } }
      ]
    }
  });

  const data = body.hits.hits.map((hit: any) => hit._source);
  const total = (body.hits.total as { value: number; relation: string }).value

  return { data, total };
}

export async function getNextWorkshopId(): Promise<number> {
  const client = es();

  // Asegura índice para el contador (idempotente)
  const exists = await client.indices.exists({ index: COUNTER_INDEX });
  if (!exists) {
    await client.indices.create({
      index: COUNTER_INDEX,
      body: {
        mappings: {
          properties: {
            last_id: { type: "integer" },
          },
        },
      },
    } as any);
    const lastId = await getLastWorkshopId();
    await client.index({
      index: COUNTER_INDEX,
      id: COUNTER_ID,
      document: { last_id: lastId },
      refresh: true,
    });
  }

  // Update atómico: si no existe, parte en 0; si existe, suma 1
  const res: any = await client.update({
    index: COUNTER_INDEX,
    id: COUNTER_ID,
    body: {
      script: {
        source: "ctx._source.last_id += 1",
      },
      upsert: {
        last_id: 0,
      },
    },
    _source: true,
    refresh: "true",
  });

  // según versión del client puede venir en res.get o res.body.get
  const source =
    res.get?._source ||
    res.body?.get?._source;

  if (!source || typeof source.last_id !== "number") {
    throw new Error("No se pudo obtener el nuevo ID para workshop");
  }

  return source.last_id;
}

export async function getLastWorkshopId(): Promise<number> {
  const client = es();
  const res = await client.search({
    index: INDEX,
    size: 1,
    sort: [{ id: "desc" }],
    _source: ["id"],
  });

  return (res.hits.hits[0]?._source as any)?.id ?? 0;
}


export async function createWorkshop(workshop: any,id: number) {
  const client = es();
  const body = await client.index({
    index: INDEX,
    body: {
      id,
      ...workshop
    },
    refresh: true,
  });
  return body;
}

export async function updateWorkshop(id: number, workshop: any) {
  const client = es();

  // Evita enviar undefined
  const cleanWorkshop = Object.fromEntries(
    Object.entries(workshop).filter(([, v]) => v !== undefined)
  );

  console.log("Clean workshop data:", cleanWorkshop);
  const body = await client.updateByQuery({
    index: INDEX,
    refresh: true,
    body: {
      script: {
        lang: 'painless',
        source: Object.keys(cleanWorkshop)
          .map((key) => `ctx._source.${key} = params.${key}`)
          .join('; '),
        params: cleanWorkshop,
      },
      query: {
        term: { id }
      },
    },
  });

  return body;
}

export async function deleteWorkshop(id: number) {
  const client = es();
  const body = await client.deleteByQuery({
    index: INDEX,
    body: {
      query: {
        match: { id }
      }
    },
    refresh: true,
  });
  return body;
} 