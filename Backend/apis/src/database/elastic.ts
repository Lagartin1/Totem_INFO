import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" }); // o quita path si ya estás en el root correcto

const node =
  process.env.ELASTIC_NODE ||
  process.env.ELASTICSEARCH_URL || // fallback por si cambiaste nombre
  "";

if (!node) {
  throw new Error("Falta ELASTIC_NODE (o ELASTICSEARCH_URL) en .env");
}

let client: Client;

export function es() {
  if (!client) {
    const apiKey = process.env.ELASTIC_API_KEY;       // encoded
    const apiKeyId = process.env.ELASTIC_API_KEY_ID;  // opcional
    const apiKeyVal = process.env.ELASTIC_API_KEY_VALUE;

    let auth:
      | { apiKey: string }
      | { apiKey: { id: string; api_key: string } }
      | { username: string; password: string }
      | undefined;

    if (apiKey) {
      auth = { apiKey };
    } else if (apiKeyId && apiKeyVal) {
      auth = { apiKey: { id: apiKeyId, api_key: apiKeyVal } };
    } else if (process.env.ELASTIC_USERNAME && process.env.ELASTIC_PASSWORD) {
      auth = {
        username: process.env.ELASTIC_USERNAME!,
        password: process.env.ELASTIC_PASSWORD!,
      };
    } else {
      // Si no pones auth y tu ES tiene security enabled, fallará más adelante.
      // Puedes forzar aquí el error para que sea claro.
      throw new Error("No se encontraron credenciales (API Key o USER/PASS) para ES");
    }
    console.log("Conectando a ES en", node);
    client = new Client({ node, auth });
  }
  return client;
}
