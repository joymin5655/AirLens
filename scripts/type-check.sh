#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo "Running TypeScript type check..."
npx tsc -b --noEmit
echo "Type check passed."
