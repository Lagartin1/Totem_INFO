import { es } from "../../database/elastic.ts"
const INDEX = process.env.PRACTICA_INDEX || "practicas";

const REQUIRED_PROPERTIES = {
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
  requisitos_especiales: { type: "text" },
  state: { type: "boolean" },
  visitas: { type: "integer" },

  // 👉 Aquí agregas los NUEVOS campos que quieras garantizar:
  // ejemplo:
  // carrera_objetivo: { type: "keyword" },
  // plazo_postulacion: { type: "date" },
};

async function ensureIndex() {
  const client = es();

  const exists = await client.indices.exists({ index: INDEX });

  if (!exists) {
    // Crear índice con TODO el mapping requerido
    await client.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: REQUIRED_PROPERTIES,
        },
      },
    } as any);

    console.log(`Index ${INDEX} creado`);
    return;
  }

  // Si ya existe: revisar mapping actual y agregar solo lo que falte
  const current = await client.indices.getMapping({ index: INDEX });
  const currentProps =
    current[INDEX]?.mappings?.properties || {};

  const newProps: Record<string, any> = {};

  for (const [field, definition] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!currentProps[field]) {
      newProps[field] = definition;
    }
  }

  if (Object.keys(newProps).length > 0) {
    await client.indices.putMapping({
      index: INDEX,
      body: {
        properties: newProps,
      },
    } as any);

    console.log(
      `Index ${INDEX} actualizado con nuevos campos: ${Object.keys(
        newProps
      ).join(", ")}`
    );
  } else {
    console.log(`Index ${INDEX} ya existe y tiene todos los campos requeridos`);
  }
}

ensureIndex().catch((e) => {
  console.error(e);
  process.exit(1);
});
