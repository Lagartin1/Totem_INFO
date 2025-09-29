import { es } from "./elastic.ts";

const INDEX = process.env.BECADOS_INDEX || "becados";

async function ensureIndex() {
  const client = es();
  const exists = await client.indices.exists({ index: INDEX });
  if (!exists) {
    await client.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            id: { type: "integer" },
            created_at: { type: "date", format: "strict_date_optional_time||epoch_millis" },
            nombre: { type: "keyword" },
            titulo: { type: "text", analyzer: "spanish" },
            descripcion: { type: "text", analyzer: "spanish" }
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
