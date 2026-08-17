#!/bin/sh

set -e

pnpm i --frozen-lockfile --ignore-scripts

pnpm update-version

pnpm check

pnpm publish-script

echo "✅ Publish completed"
