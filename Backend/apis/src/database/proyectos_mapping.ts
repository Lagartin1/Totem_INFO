import { es } from "./elastic.ts";

const INDEX = process.env.PROYECTS_INDEX || "proyects";

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
            profesores: { type: "keyword" },
            titulo: { type: "text" },
            area_desarrollo: { type: "text" },
            descripcion: { type: "text" },
            correo_contacto: { type: "keyword" },
            telefono_contacto: { type: "keyword" }
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
