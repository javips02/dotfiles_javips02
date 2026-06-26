#!/usr/bin/env bash
# Wrapper to locate and invoke podman regardless of installation path
set -euo pipefail

find_podman() {
  command -v podman 2>/dev/null && return
  for p in /opt/homebrew/bin/podman /usr/local/bin/podman /usr/bin/podman; do
    [ -x "$p" ] && echo "$p" && return
  done
  echo "Error: podman not found in PATH or common install locations" >&2
  exit 1
}

exec "$(find_podman)" "$@"
