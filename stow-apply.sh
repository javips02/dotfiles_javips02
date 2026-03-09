#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Check for gum (for pretty output)
if command -v gum >/dev/null 2>&1; then
  GUM=1
else
  GUM=0
fi

# Show a welcome message with gum if available
WELCOME_MSG="Dotfiles Stow Apply\n\nThis script will preview and apply symlinks for your dotfiles packages.\nYou will be prompted before any changes are made.\nIf a package has a README.md, it will be shown before stowing."
if [ "$GUM" -eq 1 ]; then
  echo -e "$WELCOME_MSG" | gum style --border double --margin "1 2" --padding "1 4" --foreground 212 --border-foreground 57
else
  echo -e "$WELCOME_MSG"
fi
usage() {
      echo "Usage: $0 [macos|linux|windows]" >&2
      exit 1
    }

    if [ "$#" -ne 1 ]; then
      usage
    fi

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
    esac

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
    # Show package README.md with gum style if available
    if [ -f "$pkg/README.md" ]; then
      echo
      if [ "$GUM" -eq 1 ]; then
        gum style --border normal --margin "1 2" --padding "1 4" < "$pkg/README.md"
      else
        cat "$pkg/README.md"
      fi
    fi
    echo
    echo "Previewing stow for $pkg..."
    stow -n -v -t "$HOME" "$pkg" | tee "/tmp/stow-preview-$pkg.txt"

    # Check for potential conflicts (lines with 'existing' or 'WARNING')
    if grep -qE 'existing|conflict|WARNING' "/tmp/stow-preview-$pkg.txt"; then
      echo "Potential conflicts detected for $pkg."
      if [ "$GUM" -eq 1 ]; then
        gum confirm "Do you want to back up and overwrite existing files for $pkg?" || { echo "Skipping $pkg."; continue; }
      else
        read -r -p "Do you want to back up and overwrite existing files for $pkg? [y/N]: " confirm
        case "$confirm" in
          [Yy]*) ;;
          *) echo "Skipping $pkg."; continue ;;
        esac
      fi
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
    else
      if [ "$GUM" -eq 1 ]; then
        gum confirm "No conflicts for $pkg. Proceed with stow?" || { echo "Skipping $pkg."; continue; }
        echo "Stowing $pkg..."
        stow -t "$HOME" "$pkg"
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
    fi
    rm -f "/tmp/stow-preview-$pkg.txt"
  else
    echo "Warning: package $pkg does not exist, skipping."
  fi
done


echo "Done."
