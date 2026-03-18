#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo "Running ESLint with auto-fix..."
npm run lint -- --fix
echo "Lint fix complete."
