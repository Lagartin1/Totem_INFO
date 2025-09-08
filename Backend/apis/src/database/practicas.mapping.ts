import { es } from "./elastic.ts";

const INDEX = process.env.FORMS_INDEX || "forms";

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
            tipo_practica: { type: "keyword" },
            nombre_contacto: { type: "text" },
            cargo_contacto: { type: "text" },
            correo_contacto: { type: "keyword" },
            telefono_contacto: { type: "keyword" },
            nombre_empresa: { type: "text" },
            sitio_web_empresa: { type: "keyword" },
            unidad_empresa: { type: "text" },
            fechas_practica: { type: "text" },
            modalidad: { type: "keyword" },
            sede_practica: { type: "text" },
            regimen_trabajo: { type: "keyword" },
            labores: { type: "text" },
            beneficios: { type: "text" },
            requisitos_especiales: { type: "text" }
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
