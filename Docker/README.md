
## Consideraciones

- Los puertos por defecto son `9080` para el frontend, `3000` para el backend y `9200` para Elasticsearch. Puedes cambiarlos en el archivo `compose.prod.yml`, segun tus necesidades.


## Build 
Para construir los contenedores, ejecuta el siguiente comando en la carpeta `Docker` del proyecto:

```bash
sudo docker compose -f Docker/compose.prod.yml build
```

## Run
Para iniciar los contenedores, ejecuta el siguiente comando en la carpeta `Docker` del
proyecto:

```bash
sudo docker compose -f Docker/compose.prod.yml up -d
```

### Cargar Snapshots de Elasticsearch (Backup)

El puerto por defecto de Elasticsearch es el `9200`. tanto dentro de la red de contenedores como afuera, aunque se puede cambiar en el archivo `compose.prod.yml`. hacia abajo en los framgentos de código puedes ver como se expone como puerto `PUERTO` y esto debes cambiarlo segun corresponda.

#### Snapshot en la carpeta del proyecto
En la carpeta `./Database/backup` del proyecto, puedes ver un archivo comprimido con los snapshots de Elasticsearch. Este archivo contiene un snapshot de ejemplo que puedes usar para restaurar datos en tu instancia de Elasticsearch.
Ahora debes descomprimir el archivo `es_snapshots.tar.gz` en la carpeta `./Database/backup/es_snapshots` del proyecto. Puedes hacerlo con el siguiente comando estando en la carpeta `Docker` del proyecto:

```bash
tar -xvzf ./Database/backup/es_snapshots.tar.gz -C ./Database/backup/
```
y luego darle permisos pertinentes con:
```bash
sudo chmod -R 1000:0 ./Database/backup/es_snapshots 
```

#### Restaurar el Snapshot

 1.  Crea dentro del contenedor la ruta donde se encuentran los snapshots. En este caso, la ruta es `/snapshots`, que está mapeada a `./Database/backup/es_snapshots` en el host.
 
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
 2.   Verifica que el snapshot se haya registrado correctamente:

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


 3. Ahora Restaura el snapshot deseado (reemplaza `snapshot_1` con el nombre de tu snapshot):

    ```bash
    curl -u elastic:test123 \  -H 'Content-Type: application/json' \             
    -X POST http://localhost:PUERTO/_snapshot/local_backup/snapshot_1/_restore \
    -d '{
        "indices": "*",
        "include_global_state": true
    }'
        ``` 