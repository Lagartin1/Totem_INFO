import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config({path: './.env'});



const node = process.env.ELASTIC_NODE;
if (!node) {
  throw new Error("❌ Falta ELASTIC_NODE en .env.local");
}
let client: Client;

export function es() {
  if (!client) {
    const username = process.env.ELASTIC_USERNAME;
    const password = process.env.ELASTIC_PASSWORD;
    const apiKey = process.env.ELASTIC_API_KEY;
    
    client = new Client({
      node: process.env.ELASTIC_NODE!,
      auth: apiKey
        ? { apiKey }
        : {
            username: username!,
            password: password!,
          },
    });
  }
  return client;
}


