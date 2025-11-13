
import { es } from "../../database/elastic.ts"

const INDEX = process.env.PROYECTOS_INDEX || "proyectos";

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
            autores: { type: "keyword" },
            titulo: { type: "text", analyzer: "spanish" },
            area_desarrollo: { type: "text", analyzer: "spanish" },
            descripcion: { type: "text", analyzer: "spanish" },
            correo_contacto: { type: "keyword" },
            telefono_contacto: { type: "keyword" },
            fecha_publicacion: {type: "text"},
            videos : { type: "keyword" },
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
