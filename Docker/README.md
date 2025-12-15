
## Consideraciones

Los puertos por defecto son `9080` para el frontend y `3000` para el backend. Puedes cambiarlos en el archivo `compose.prod.yml` según tus necesidades.


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

### Backups

En este repositorio hay una carpeta `Docker/Database/backup` que contiene backups y datos de ejemplo para los servicios incluidos. Para restaurar o cargar datos revisa la carpeta correspondiente y usa la herramienta adecuada (por ejemplo `mongorestore` para MongoDB).