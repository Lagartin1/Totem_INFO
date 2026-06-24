# Totem_INFO

## Descripción

Esta aplicación web centraliza la información académica y profesional de la carrera **Ingeniería Civil en Informática (UACh)**:

* Prácticas (Profesionales e Iniciales)
* Workshops
* Noticas
* Giras de estudio
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

Esta guía está pensada exclusivamente para la persona que quiere ejecutar el proyecto en su máquina local. Contiene sólo los pasos mínimos para poner la aplicación en marcha.

- ## Requisitos mínimos
- Docker & Docker Compose (opcional)
- Node.js 14+ (frontend & backend)
- Python 3.11 (opcional: para el synchronizer)

## Clonar

```bash
git clone https://github.com/Lagartin1/Totem_INFO.git
cd Totem_INFO
```

## Instalación rápida

Backend (APIs):

```bash
cd Backend/apis
npm ci
```

Frontend:

```bash
cd Frontend
npm ci
```

## Variables de entorno
Coloca tus variables en `Backend/apis/.env` (puedes basarte en `Backend/apis/.env.example`). Mínimos típicos:


- `MONGODB_URL` (conexión MongoDB)
- `API_UPLOAD_URL` (opcional: URL que recibe datos desde el synchronizer)

Credenciales Mongo (para entorno local)

Para facilitar el arranque local, el proyecto incluye configuración de Mongo en los ficheros Docker.
Las credenciales utilizadas en local son:

- Usuario: `admin`
- Contraseña: `test123`
- Base de datos: `totem_admins`
- Host (compose): `database_mongo:27017`

Ejemplo de `MONGODB_URL` que puedes copiar en `Backend/apis/.env` y en `Backend/apis/src/config/.env`:

```env
MONGODB_URL="mongodb://admin:test123@database_mongo:27017/totem_admins?authSource=admin&replicaSet=rs0"
```

Si ejecutas Mongo localmente en tu máquina (puerto 27017), usa esta variante:

```env
MONGODB_URL="mongodb://admin:test123@localhost:27017/totem_admins?authSource=admin&replicaSet=rs0"
```

## Ejecutar localmente

1) (Opcional) Levanta servicios dependientes con Docker Compose si los necesitas.

2) Inicia el backend API:

```bash
cd Backend/apis
npm run dev
```

3) Inicia el frontend:

```bash
cd Frontend
npm run dev
```

URLs por defecto:

- Frontend → http://localhost:3004
- Backend  → http://localhost:4004

### MongoDB (requerido)

La aplicación requiere MongoDB en ejecución. Puedes usar el servicio ya definido en los archivos Docker del repo:

```bash
# Desde la raíz del proyecto levanta solo el servicio mongo
docker-compose -f Docker/compose.prod.yml up -d database_mongo
```

El servicio se llama `database_mongo` y monta los datos desde `Docker/Database/backup/mongo_data`.

### Poblar datos de ejemplo (seed)

Para insertar datos dummy usando el seed de Prisma:

```bash
cd Backend/apis
# Asegúrate de que MONGODB_URL apunta al mongo levantado
npx prisma db push
npx prisma db seed
```

Si `npx prisma db seed` falla, instala dependencias de desarrollo en `Backend/apis` con `npm ci`.

## Synchronizer (Google Sheets → API)

El componente `Backend/synchronizer/sincronize_practicas.py` es opcional y sirve para leer filas desde una Google Sheet y enviarlas a la API.

Condiciones para ejecutar el synchronizer:

- Debes tener acceso en Google Cloud Console y credenciales OAuth (tipo "Desktop") — descarga `client_secret.json` y colócalo en `Backend/synchronizer` localmente.
- La Google Sheet debe tener la estructura esperada (columnas A–P con headers: `marca_temporal`, `tipo_practica`, `nombre_contacto`, ..., `requisitos_especiales`). El script ignora columnas vacías o extras.
- El script genera un `token.json` local tras autorizar; **no** lo subas al repositorio.

Cómo ejecutarlo:

```bash
cd Backend/synchronizer
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Asegúrate de tener client_secret.json y exportar SHEET_URL (y API_UPLOAD_URL si procede)
python sincronize_practicas.py
```
