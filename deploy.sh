#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/Docker/compose.prod.yml"
TARGET_REF="${1:-}"

cd "$ROOT_DIR"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "No se encontró $COMPOSE_FILE" >&2
  exit 1
fi

if [[ -n "$TARGET_REF" ]]; then
  git fetch --all --tags
  git checkout "$TARGET_REF"
  git reset --hard "$TARGET_REF"
else
  git pull --ff-only
fi

mkdir -p Backend/synchronizer
: > Backend/synchronizer/.env
: > Backend/synchronizer/.last_fetch.json

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker-compose)
else
  echo "No se encontró Docker Compose" >&2
  exit 1
fi

"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" config
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" build --parallel
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" up -d

echo "Despliegue completado en $ROOT_DIR"
