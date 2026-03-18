#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo "Building for GitHub Pages (base: /AirLens/)..."
DEPLOY_TARGET=github npm run build
echo "Build complete. Output: dist/"
