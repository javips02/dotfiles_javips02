
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Check for required command
if ! command -v stow >/dev/null 2>&1; then
  echo "Error: GNU Stow is not installed or not in PATH." >&2
  exit 2
fi


usage() {
  echo "Usage: $0 [macos|linux|windows]" >&2
  exit 1
}


if [ "$#" -ne 1 ]; then
  usage
fi

esac

case "$1" in
  macos)
    pkgs=(nvim shell wmmacos tmux)
    ;;
  linux)
    pkgs=(ags asound bar dwmconfig hyprsuite menus notifications nvim qtile shell sway terminal tmux)
    ;;
  windows)
    pkgs=(nvim shell)
    ;;
  *)
    usage
    ;;

done
echo "Done."

echo "Applying stow for: ${pkgs[*]}"
# Prevent accidental double execution
if [ "${STOW_APPLY_ALREADY_RUN:-}" = "1" ]; then
  echo "Error: This script appears to be running twice. Aborting." >&2
  exit 3
fi
export STOW_APPLY_ALREADY_RUN=1

echo "Done."

for pkg in "${pkgs[@]}"; do
  if [ -d "$pkg" ]; then
    echo
    echo "Previewing stow for $pkg..."
    stow -n -v -t "$HOME" "$pkg" | tee "/tmp/stow-preview-$pkg.txt"

    # Check for potential conflicts (lines with 'existing' or 'WARNING')
    if grep -qE 'existing|conflict|WARNING' "/tmp/stow-preview-$pkg.txt"; then
      echo "Potential conflicts detected for $pkg."
      read -r -p "Do you want to back up and overwrite existing files for $pkg? [y/N]: " confirm
      case "$confirm" in
        [Yy]*)
          # Parse the preview output for files to be replaced
          grep 'existing' "/tmp/stow-preview-$pkg.txt" | awk '{print $NF}' | while read -r f; do
            if [ -e "$f" ]; then
              backup="$f.backup.$(date +%Y%m%d%H%M%S)"
              echo "Backing up $f to $backup"
              mv -- "$f" "$backup"
            fi
          done
          echo "Stowing $pkg (with backup)..."
          stow -t "$HOME" "$pkg"
          ;;
        *)
          echo "Skipping $pkg."
          ;;
      esac
    else
      read -r -p "No conflicts for $pkg. Proceed with stow? [y/N]: " confirm
      case "$confirm" in
        [Yy]*)
          echo "Stowing $pkg..."
          stow -t "$HOME" "$pkg"
          ;;
        *)
          echo "Skipping $pkg."
          ;;
      esac
    fi
    rm -f "/tmp/stow-preview-$pkg.txt"
  else
    echo "Warning: package $pkg does not exist, skipping."
  fi
done


echo "Done."
