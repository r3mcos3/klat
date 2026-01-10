#!/bin/bash
set -e

echo "Building backend..."
cd apps/backend
npm run build

echo "Copying compiled backend to /api..."
cd ../..
mkdir -p api/dist
cp -r apps/backend/dist/* api/dist/
cp -r apps/backend/src api/

echo "API build complete!"
