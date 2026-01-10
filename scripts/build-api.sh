#!/bin/bash
set -e

echo "Building backend for API..."
echo "Installing ALL dependencies (including dev)..."
npm install
echo "Building backend..."
npm run build --workspace=apps/backend

echo "Copying backend to /api..."
rm -rf api/src api/dist 2>/dev/null || true
mkdir -p api/dist
cp -r apps/backend/dist/* api/dist/ 2>/dev/null || echo "No dist to copy"
cp -r apps/backend/src api/ 2>/dev/null || echo "No src to copy"

echo "API build complete!"
ls -la api/
