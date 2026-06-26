#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"

exec "$SCRIPT_DIR/mcp-wrapper.sh" run --rm -i --platform linux/amd64 \
  -e "JIRA_URL=https://jira.tools.3stripes.net/" \
  -e "JIRA_PERSONAL_TOKEN=${JIRA_PERSONAL_TOKEN}" \
  -e "CONFLUENCE_URL=https://confluence.tools.3stripes.net/" \
  -e "CONFLUENCE_PERSONAL_TOKEN=${CONFLUENCE_PERSONAL_TOKEN}" \
  registry.tools.3stripes.net/pe-mcp-servers/mcp-atlassian:2026-05-14-3ceb53a \
  --transport stdio
