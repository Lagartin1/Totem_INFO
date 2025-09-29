import { es } from "./elastic.ts";

const INDEX = process.env.NOTICIAS_INDEX || "noticias";

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
            titulo: { 
              type: "text",
              fields: { raw: { type: "keyword" } }
            },
            descripcion: { type: "text" },
            contenido: { type: "text" },
            autor: { 
              type: "text",
              fields: { raw: { type: "keyword" } }
            },
            fecha_publicacion: { type: "date" },
            categoria: { 
              type: "text",
              fields: { raw: { type: "keyword" } }
            }
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
