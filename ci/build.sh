#!/bin/bash
# ci/build.sh: Script de compilación para Totem INFO

set -e # Detener el script si ocurre algún error

echo "======================================"
echo "Iniciando compilación de Totem INFO..."
echo "======================================"

# 1. Compilar Frontend Público
echo "-> Compilando Frontend..."
cd Frontend
npm ci
npm run build
cd ..

# 2. Compilar Frontend de Administración
echo "-> Compilando FrontendAdmin..."
cd FrontendAdmin
npm ci
npm run build
cd ..

# 3. Compilar Backend (Next.js API)
echo "-> Compilando Backend APIs..."
cd Backend/apis
npm ci
npm run build
cd ../..

# 4. Validar dependencias de Python (Synchronizer)
echo "-> Validando dependencias del Synchronizer..."
cd Backend/synchronizer
pip install -r requirements.txt
cd ../..

echo "======================================"
echo "✅ Compilación exitosa de todos los módulos."
echo "======================================"
