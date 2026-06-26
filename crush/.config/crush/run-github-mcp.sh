#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"

exec "$SCRIPT_DIR/mcp-wrapper.sh" run --rm -i \
  -e "GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_PERSONAL_ACCESS_TOKEN}" \
  registry.tools.3stripes.net/pe-mcp-servers/github-mcp-server:2026-05-28-490504b
