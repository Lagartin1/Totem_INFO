import { Router } from "express";
import { es } from "../elastic";

const router = Router();
const INDEX = process.env.FORMS_INDEX || "forms";
const client = es();

/**
 * Endpoint de búsqueda avanzada
 * Query params soportados:
 * - q: búsqueda global (multi_match en campos de texto)
 * - modalidad, tipo_practica, regimen_trabajo, correo_contacto, sitio_web_empresa: filtros exactos
 * - nombre_empresa, unidad_empresa, sede_practica, labores, beneficios, requisitos_especiales: fuzzy search
 * - page, size: paginación
 * - sort, order: ordenar resultados
 */
router.get("/", async (req, res) => {
  try {
    const {
      q,
      modalidad,
      tipo_practica,
      regimen_trabajo,
      correo_contacto,
      sitio_web_empresa,
      nombre_empresa,
      unidad_empresa,
      sede_practica,
      labores,
      beneficios,
      requisitos_especiales,
      page = "1",
      size = "10",
      sort = "created_at",
      order = "desc",
    } = req.query;

    const from = (parseInt(page as string) - 1) * parseInt(size as string);

    const must: any[] = [];
    const filter: any[] = [];

    // Búsqueda global en varios campos
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fuzziness: "AUTO",
          fields: [
            "marca_temporal",
            "nombre_contacto",
            "cargo_contacto",
            "nombre_empresa",
            "unidad_empresa",
            "sede_practica",
            "labores",
            "beneficios",
            "requisitos_especiales",
          ],
        },
      });
    }

    // Filtros exactos (campos keyword)
    if (modalidad) filter.push({ term: { modalidad } });
    if (tipo_practica) filter.push({ term: { tipo_practica } });
    if (regimen_trabajo) filter.push({ term: { regimen_trabajo } });
    if (correo_contacto) filter.push({ term: { correo_contacto } });
    if (sitio_web_empresa) filter.push({ term: { sitio_web_empresa } });

    // Búsqueda difusa específica en campos text
    const fuzzyFields: Record<string, string | undefined> = {
      nombre_empresa: nombre_empresa as string,
      unidad_empresa: unidad_empresa as string,
      sede_practica: sede_practica as string,
      labores: labores as string,
      beneficios: beneficios as string,
      requisitos_especiales: requisitos_especiales as string,
    };

    for (const [field, value] of Object.entries(fuzzyFields)) {
      if (value) {
        must.push({
          match: {
            [field]: {
              query: value,
              fuzziness: "AUTO",
            },
          },
        });
      }
    }

    const query = { bool: { must, filter } };

    const response = await client.search({
      index: INDEX,
      from,
      size: parseInt(size as string),
      sort: [{ [sort as string]: { order } }],
      query,
    });

    res.json({
      total: response.hits.total,
      results: response.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      })),
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
