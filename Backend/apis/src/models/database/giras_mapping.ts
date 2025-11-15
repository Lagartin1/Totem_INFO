import { es } from "../../database/elastic.ts"

const INDEX = process.env.BECADOS_INDEX || "giras";

async function ensureIndex() {
  const client = es();
  const exists = await client.indices.exists({ index: INDEX });
  if (!exists) {
    await client.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            titulo: { type: "text", analyzer: "spanish" },
            descripcion: { type: "text", analyzer: "spanish" },
            anio: {type: "text"},
            lugares: {type: "keyword"},
            videos: { type: "keyword"},
          }
        }
      }
    } as any);
    console.log(`Index ${INDEX} creado`);
  } else {
    console.log(`Index ${INDEX} ya existe`);
  }
}

ensureIndex().catch((e) => {
  console.error(e);
  process.exit(1);
});
