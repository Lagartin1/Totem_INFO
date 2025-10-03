import { es } from "../../database/elastic.ts";

const INDEX = process.env.TESIS_INDEX || "tesis";

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
            marca_temporal: { type: "text" },
            profesor: { type: "keyword" },
            titulo: { type: "text" },
            area_desarrollo: { type: "text" },
            descripcion: { type: "text" },
            autor: { type: "text" },
            idioma: { type: "text" },
            anio: { type: "integer" },
            resumen: { type: "text" },
            universidad: { type: "text" },
            facultad: { type: "text" },
            palabras_clave: { type: "text" },
          }
        }
      }
    }as any);
    console.log(`Index ${INDEX} creado`);
  } else {
    console.log(`Index ${INDEX} ya existe`);
  }
}

ensureIndex().catch((e) => {
  console.error(e);
  process.exit(1);
});
