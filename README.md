# Totem_INFO

## 📌 Descripción

Esta aplicación web centraliza la información académica y profesional de la carrera **Ingeniería Civil en Informática (UACh)**:

* Prácticas (Profesionales e Iniciales)
* Tesis
* Proyectos
* Becas

El objetivo es facilitar a estudiantes y personal académico el acceso rápido a oportunidades y recursos.
## Clonado del repositorio

```bash
git clone   https://github.com/lagarin1/Totem_INFO.git
```
## Setup del entorno de desarrollo

1. Instalar [Docker](https://docs.docker.com/get-docker/).
2. Instalar [Docker Compose](https://docs.docker.com/compose/install/).
3. Instalar [Node.js](https://nodejs.org/) (versión 14 o superior).

## Configuración del proyecto
1. Navegar a la carpeta del proyecto clonado:

```bash
cd Totem_INFO
``` 
2. Instalar las dependencias del backend:

```bash
cd Backend/api
npm ci
```

3. Instalar las dependencias del frontend:

```bash
cd ../../Frontend
npm ci
```

4. Volver agregar el archivo `.env` en la carpeta `Backend/apis/src/config` con las variables de entorno necesarias. Puedes basarte en el archivo proporcionado `.env.example`, aqui se ve el estracto de este archivo:

```env
ELASTIC_NODE=changeme
ELASTIC_USERNAME=changeme
ELASTIC_PASSWORD=changeme
```
## Ejecución para desarrollo
Para ejecutar el proyecto en modo desarrollo, sigue estos pasos:
1. Levantar los servicios de producción local (Elasticsearch) usando Docker Compose (ver sección siguiente).
2. En una terminal, navegar a la carpeta del backend y ejecutar:
    ```bash
    cd Backend/api
    npm run dev
    ```
3. En otra terminal, navegar a la carpeta del frontend y ejecutar:
    ```bash
    cd Frontend
    npm run dev
    ```
## Levantar Elasticsearch localmente con docker de pruebas

1. en la carpeta dentro de `Docker` existe una carpeta `Database` hay otra la carpeta llamada `backup` , aqui se encuentran un snapshot de elasticsearch con los indices necesarios para que la aplicacion funcione.

2. descomprimir el archivo `es_snapshots.tar.gz` en la carpeta `./Database/backup/es_snapshots` del proyecto. Puedes hacerlo con el siguiente comando estando en la carpeta `Docker` del proyecto:

    ```bash
    tar -xvzf ./Database/backup/es_snapshots.tar.gz -C ./Database/backup/
    ```
    y luego darle permisos pertinentes con:
    ```bash
    sudo chown -R 1000:0 ./Database/backup/es_snapshots
    sudo chmod -R 775 ./Database/backup/es_snapshots
    ```
3. Navegar a la carpeta `Docker` del proyecto y subir el servicio de Elasticsearch con:

    ```bash
    cd Docker
    docker-compose -f compose.dev.yml up database -d  
    ```

4.  Crea dentro del contenedor la ruta donde se encuentran los snapshots. En este caso, la ruta es `/snapshots`, que está mapeada a `./Database/backup/es_snapshots` en el host.
    ```bash
    curl -u USERNAME:PASSWORD \  -H 'Content-Type: application/    json' \              
            -X PUT http://localhost:PUERTO/_snapshot/local_backup
            \
            -d '{
                "type": "fs",
                "settings": {
                "location": "/snapshots",
                "compress": true
                }
            }'
    ```
5. Verifica que el snapshot se haya registrado correctamente:

    ```bash
    curl -u USERNAME:PASSWORD -X GET "localhost:9200/_snapshot/local_backup/_all?pretty"
    ```
    se mostrara una lista de snapshots disponibles en el repositorio `local_backup`. ejemplo:
    ```json
        {
          "snapshots" : [
            {
              "snapshot" : "snapshot_1",
              "uuid" : "some-uuid
                "version_id" : 8140399,
                "version" : "8.14.3",
                "indices" : [
                  "index1",
                  "index2"
                ],
                "data_streams" : [ ],
                "state" : "SUCCESS",
                "start_time" : "2024-06-20T12:00:00
                "end_time" : "2024-06-20T12:05:00.000Z",
                "duration_in_millis" : 300000,
                "failures" : [ ],
                "shards" : {
                    "total" : 10,
                    "failed" : 0,
                    "successful" : 10
                }
            }
          ]
        }
    ``` 


6. Ahora Restaura el snapshot deseado (reemplaza `snapshot_1` con el nombre de tu snapshot):

    ```bash
    curl -u elastic:test123 \  -H 'Content-Type: application/json' \             
    -X POST http://localhost:PUERTO/_snapshot/local_backup/snapshot_1/_restore \
    -d '{
        "indices": "*",
        "include_global_state": true
    }'
    ``` 

## Servicios de producción local

### Requisitos previos
- Tener Docker y Docker Compose instalados.
- Tener los snapshots de Elasticsearch descomprimidos en `./Database/backup/es_snapshots` dentro de la carpeta `Docker`.

### Levantar servicios
estando en la raíz del proyecto, ejecutar:

```bash
docker-compose -f docker/docker-compose.dev.yml up --build
```

### Agregar datos iniciales

Para agregar los datos iniciales, sigue los pasos de la sección **"Levantar Elasticsearch localmente con docker de pruebas"**, específicamente los pasos **4, 5 y 6**.

### Detener servicios
Para detener los servicios, ejecutar:

```bash
docker-compose -f docker/docker-compose.dev.yml down
```
# Acceder
Frontend → http://localhost:3004
Backend  → http://localhost:4004
Elasticsearch → http://localhost:5004

