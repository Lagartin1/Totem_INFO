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
cd ../Frontend
npm ci
```

4. Volver agregar el archivo `.env` en la carpeta `Backend/apis` con las variables de entorno necesarias. Puedes basarte en el archivo proporcionado aqui:

```env
ELASTIC_NODE=http://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=changeme
FORMS_INDEX=practicas
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

1. en la carpeta dentro de `Backend` existe una carpeta `database` con un archivo `docker-compose.yml` para levantar un contenedor de Elasticsearch con las configuraciones necesarias.

```bash
cd Backend/database
docker-compose up -d
```

## Servicios de producción local

# Levantar servicios
estando en la raíz del proyecto, ejecutar:

```bash
docker-compose -f docker/docker-compose.dev.yml up --build
```
# Acceder
Frontend → http://localhost:9080
Backend  → http://localhost:3000
Elasticsearch → http://localhost:9200

