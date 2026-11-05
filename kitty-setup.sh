#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"

fail() {
  echo "Error: $*" >&2
  exit 2
}

if [ "$#" -ne 1 ]; then
  fail "Usage: $0 macos|linux"
fi
case "$1:$(uname -s)" in
  macos:Darwin|linux:Linux) ;;
  *) fail "Choose macos or linux to match the current operating system." ;;
esac

kitty_bin=""
app=""
if [ "$1" = macos ]; then
  for candidate in /Applications/kitty.app "$HOME/Applications/kitty.app"; do
    if [ -x "$candidate/Contents/MacOS/kitty" ]; then
      app="$candidate"
      break
    fi
  done
  if [ -z "$app" ]; then
    command -v brew >/dev/null 2>&1 || fail "Homebrew is required to install kitty on macOS."
    brew install --cask kitty
    app="/Applications/kitty.app"
  fi
  kitty_bin="$app/Contents/MacOS/kitty"
else
  if command -v kitty >/dev/null 2>&1; then
    kitty_bin="$(command -v kitty)"
  elif [ -x "$HOME/.local/kitty.app/bin/kitty" ]; then
    kitty_bin="$HOME/.local/kitty.app/bin/kitty"
  else
    sudo_cmd=()
    if [ "$(id -u)" -ne 0 ]; then
      command -v sudo >/dev/null 2>&1 || fail "sudo is required to install kitty."
      sudo_cmd=(sudo)
    fi
    if command -v apt-get >/dev/null 2>&1; then
      "${sudo_cmd[@]}" apt-get update
      "${sudo_cmd[@]}" apt-get install -y kitty
    elif command -v dnf >/dev/null 2>&1; then
      "${sudo_cmd[@]}" dnf install -y kitty
    elif command -v pacman >/dev/null 2>&1; then
      "${sudo_cmd[@]}" pacman -S --needed --noconfirm kitty
    elif command -v zypper >/dev/null 2>&1; then
      "${sudo_cmd[@]}" zypper --non-interactive install kitty
    else
      fail "No supported package manager found. Install kitty, then rerun this script."
    fi
    kitty_bin="$(command -v kitty)" || fail "kitty is still missing after installation."
  fi
fi
[ -x "$kitty_bin" ] || fail "kitty executable not found: $kitty_bin"
"$kitty_bin" --version

config_dir="${KITTY_CONFIG_DIRECTORY:-${XDG_CONFIG_HOME:-$HOME/.config}/kitty}"
mkdir -p "$config_dir"
for icon in kitty.app.icns kitty.app.png; do
  source_icon="$SCRIPT_DIR/terminal/.config/kitty/$icon"
  target_icon="$config_dir/$icon"
  [ -f "$source_icon" ] || fail "Missing repository icon: $source_icon"
  if cmp -s "$source_icon" "$target_icon"; then
    continue
  fi
  if [ -e "$target_icon" ] || [ -L "$target_icon" ]; then
    backup="$(mktemp "${target_icon}.backup.XXXXXX")"
    mv "$target_icon" "$backup"
    echo "Backed up $target_icon to $backup"
  fi
  ln -s "$source_icon" "$target_icon"
done

if [ "$1" = macos ]; then
  # Set the Finder/Dock icon without modifying the signed application resources.
  "$kitty_bin" +runpy '
from kitty.fast_data_types import cocoa_set_app_icon
import sys
cocoa_set_app_icon(*sys.argv[1:])
' "$config_dir/kitty.app.png" "$app"
  touch "$app"
  dock_pids="$(pgrep -x -u "$(id -u)" Dock || [ "$?" -eq 1 ])"
  while IFS= read -r pid; do
    [ -z "$pid" ] || kill "$pid"
  done <<< "$dock_pids"
  echo "Applied Azure to $app. Reopen kitty to refresh existing windows."
else
  applications_dir="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
  mkdir -p "$applications_dir"
  desktop="$applications_dir/kitty.desktop"
  source_desktop=""
  for candidate in "$desktop" /usr/local/share/applications/kitty.desktop \
    /usr/share/applications/kitty.desktop "$HOME/.local/kitty.app/share/applications/kitty.desktop"; do
    if [ -f "$candidate" ]; then
      source_desktop="$candidate"
      break
    fi
  done
  temporary="$(mktemp "$applications_dir/.kitty-desktop.XXXXXX")"
  trap 'rm -f "$temporary"' EXIT
  if [ -n "$source_desktop" ]; then
    # Keep distribution/user launcher options and desktop actions intact.
    KITTY_DESKTOP_ICON="$config_dir/kitty.app.png" awk '
      /^\[/ { main = ($0 == "[Desktop Entry]") }
      /^\[Desktop Entry\]$/ { print; print "Icon=" ENVIRON["KITTY_DESKTOP_ICON"]; next }
      main && /^Icon=/ { next }
      { print }
    ' "$source_desktop" > "$temporary"
  else
    cat > "$temporary" <<EOF
[Desktop Entry]
Type=Application
Name=kitty
GenericName=Terminal emulator
Exec=kitty
Icon=$config_dir/kitty.app.png
Terminal=false
Categories=System;TerminalEmulator;
StartupWMClass=kitty
EOF
  fi
  # Upstream user-local installs may not be on the desktop session's PATH.
  if [ "$kitty_bin" = "$HOME/.local/kitty.app/bin/kitty" ]; then
    escaped_bin="${kitty_bin//\\/\\\\}"
    escaped_bin="${escaped_bin//\"/\\\"}"
    escaped_bin="${escaped_bin//\`/\\\`}"
    escaped_bin="${escaped_bin//\$/\\\$}"
    KITTY_DESKTOP_BIN="$escaped_bin" awk '
      /^Exec=kitty([[:space:]]|$)/ {
        print "Exec=\"" ENVIRON["KITTY_DESKTOP_BIN"] "\"" substr($0, 11)
        next
      }
      { print }
    ' "$temporary" > "$temporary.exec"
    mv "$temporary.exec" "$temporary"
  fi
  if ! cmp -s "$temporary" "$desktop"; then
    if [ -e "$desktop" ] || [ -L "$desktop" ]; then
      backup="$(mktemp "${desktop}.backup.XXXXXX")"
      mv "$desktop" "$backup"
      echo "Backed up $desktop to $backup"
    fi
    chmod 644 "$temporary"
    mv "$temporary" "$desktop"
  fi
  if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$applications_dir"
  fi
  echo "Applied Azure to kitty windows and $desktop."
  echo "Reopen kitty; some Wayland compositors do not support custom window icons."
fi
