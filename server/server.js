// server.js
import express from "express";
import { Client } from "@elastic/elasticsearch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;
const INDEX = "practicas"; // nombre del índice existente

// Configura tu cliente de Elastic 8.14
const esClient = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "test123",
  },
});

// Endpoint para obtener prácticas con paginación
app.get("/api/practicas", async (req, res) => {
  try {
    const page = Number(req.query.pagina) || 1;
    const size = 10; // prácticas por página
    const from = (page - 1) * size;

    const result = await esClient.search({
      index: INDEX,
      from,
      size,
      query: {
        match_all: {}, // devuelve todas las prácticas
      },
    });

    const practicas = result.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    }));

    res.json({ practicas, total: result.hits.total.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
