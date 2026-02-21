#!/bin/bash
# Wrapper to run MCP IPA Guardian
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
node dist/index.js "$@"