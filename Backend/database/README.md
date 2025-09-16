¡Perfecto! Te dejo un **README.md** simple y claro con los dos pasos claves:
# Configuración de Kibana y API con Elasticsearch

## 1. Obtener token de Service Account para Kibana

Desde tu contenedor de **Elasticsearch** (ejemplo: `es01`):

```bash
docker exec -it es01 \
  /usr/share/elasticsearch/bin/elasticsearch-service-tokens \
  create elastic/kibana kibana-token
```

Esto devuelve un token largo, por ejemplo:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Copia ese token y en tu `.env` (que debe ser agregado en la carpeta que se encuentra el docker compose) agrega por:

```
KIBANA_SA_TOKEN= <aqui el token>
```

Reinicia tus contenedores:

```bash
docker compose down
```


```bash
docker compose --env-file .env up -d
```

Con esto, Kibana ya no usará el superusuario `elastic`.

---

## 2. Crear API Key para tu aplicación (Next.js)

En lugar de usar usuario/contraseña en tu API, lo correcto es usar una **API Key** con privilegios mínimos.

Ejemplo: API Key con permisos de lectura sobre el índice `practicas*`:

```bash
curl -u elastic:test123 -X POST "http://localhost:9200/_security/api_key" \
  -H "Content-Type: application/json" -d '{
  "name": "nextjs-practicas-read",
  "role_descriptors": {
    "next_practicas_reader": {
      "index": [
        {
          "names": [ "practicas*" ],
          "privileges": [ "read", "view_index_metadata" ]
        }
      ]
    }
  }
}'
```

Respuesta esperada:

```json
{
  "id": "api_key_id",
  "name": "nextjs-practicas-read",
  "expiration": null,
  "api_key": "api_key_value",
  "encoded": "VVBHV1hB...==" 
}
```

Usa el campo `encoded` directamente como variable de entorno  en el archivo `.env` en tu Next.js, que debe ser agregado en la carpeta apis:

```
ELASTIC_NODE=http://localhost:9200
ELASTIC_API_KEY=VVBHV1hB...==
```




Perfecto 🙌, ahora tienes tu backup `es_snapshots.tar.gz` dentro de `Backend/database/backup/`.
Para **cargarlo en tu Elasticsearch** tienes que hacer estos pasos:

---

## 🔹 1. Descomprimir el backup en el host

Desde la raíz del proyecto:

```bash
cd Backend/database/backup
tar -xzvf es_snapshots.tar.gz -C .
```

Esto te dejará una carpeta `es_snapshots/` con la estructura de índices, metadatos, etc.

---

## 🔹 2. Dar permisos correctos

```bash
sudo chown -R 1000:0 Backend/database/backup/es_snapshots
```

---

```bash
cd Backend/database
docker compose up -d --force-recreate
```

---

## 🔹 4. Registrar el repositorio de snapshots

Una vez que el contenedor esté arriba:

```bash
curl -u elastic:test123 \
  -H 'Content-Type: application/json' \
  -X PUT http://localhost:9200/_snapshot/local_backup \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/snapshots",
      "compress": true
    }
  }'
```

Verifica:

```bash
curl -u elastic:test123 http://localhost:9200/_snapshot/_all?pretty
```

Deberías ver tu repo `local_backup`.

---

## 🔹 5. Listar los snapshots disponibles

```bash
curl -u elastic:test123 http://localhost:9200/_snapshot/local_backup/_all?pretty
```

---

## 🔹 6. Restaurar un snapshot

Ejemplo (restaurar todo el contenido de `snap-2025-09-16-1535`):

```bash
curl -u elastic:test123 \
  -H 'Content-Type: application/json' \
  -X POST http://localhost:9200/_snapshot/local_backup/snap-2025-09-16-1535/_restore \
  -d '{
    "indices": "*",
    "include_global_state": true
  }'
```