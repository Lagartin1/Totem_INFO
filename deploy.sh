#!/usr/bin/env bash

# Frena el script si ocurre cualquier error, si una variable no existe o si falla una tubería.
set -euo pipefail

# Detecta la carpeta raíz del proyecto a partir de la ubicación del script.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Ruta al archivo de Docker Compose usado para producción.
COMPOSE_FILE="$ROOT_DIR/Docker/compose.prod.yml"
# Ref opcional recibido como primer argumento: tag, rama o commit.
TARGET_REF="${1:-}"

# Trabaja siempre desde la raíz del repositorio.
cd "$ROOT_DIR"

# Verifica que exista el compose antes de seguir.
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "No se encontró $COMPOSE_FILE" >&2
  exit 1
fi

# Si se pasó un ref, despliega exactamente esa versión.
if [[ -n "$TARGET_REF" ]]; then
  git fetch --all --tags
  git checkout "$TARGET_REF"
  git reset --hard "$TARGET_REF"
else
  # Si no se pasó un ref, actualiza la rama actual sin crear merge commits.
  git pull --ff-only
fi

# Crea archivos locales que el compose espera pero que no deben faltar en el deploy.
mkdir -p Backend/synchronizer
: > Backend/synchronizer/.env
: > Backend/synchronizer/.last_fetch.json

# Detecta qué variante de Docker Compose está instalada.
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker-compose)
else
  echo "No se encontró Docker Compose" >&2
  exit 1
fi

# Valida la definición del stack antes de construirlo.
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" config
# Construye las imágenes de todos los servicios en paralelo.
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" build --parallel
# Levanta los contenedores en segundo plano.
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" up -d

# Mensaje final de éxito.
echo "Despliegue completado en $ROOT_DIR"
