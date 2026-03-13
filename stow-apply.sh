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
      if grep -qE 'existing|conflict|WARNING|cannot stow' "/tmp/stow-preview-$pkg.txt"; then
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
        # Back up and remove files that would block stow (cannot stow ... over existing target ...)
        grep -Eo 'over existing target [^ ]+' /tmp/stow-preview-$pkg.txt | awk '{print $4}' | while read -r f; do
          if [ -e "$f" ]; then
            backup="$f.backup.$(date +%Y%m%d%H%M%S)"
            echo "Backing up $f to $backup"
            mv -- "$f" "$backup"
          fi
        done
        # Also handle 'existing' lines (for completeness)
        grep 'existing' "/tmp/stow-preview-$pkg.txt" | awk '{print $NF}' | while read -r f; do
          if [ -e "$f" ]; then
            backup="$f.backup.$(date +%Y%m%d%H%M%S)"
            echo "Backing up $f to $backup"
            mv -- "$f" "$backup"
          fi
        done
        # Rerun stow preview to ensure conflicts are resolved
        echo "Re-running stow preview for $pkg after backup/removal..."
        stow -n -v -t "$HOME" "$pkg" | tee "/tmp/stow-preview-$pkg.txt"
        if grep -qE 'cannot stow|conflict|WARNING|existing' "/tmp/stow-preview-$pkg.txt"; then
          echo "Conflicts still remain for $pkg after backup/removal. Skipping."
          rm -f "/tmp/stow-preview-$pkg.txt"
          continue
        fi
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

# --- Post-stow setup for macOS ---
if [ "$1" = "macos" ]; then
  # Create ~/.local/bin if it doesn't exist
  mkdir -p "$HOME/.local/bin"
  
  # Symlink shell bin scripts to ~/.local/bin
  if [ -d "$HOME/.dotfiles/shell/bin" ]; then
    for script in "$HOME/.dotfiles/shell/bin"/*; do
      if [ -f "$script" ]; then
        script_name=$(basename "$script")
        symlink="$HOME/.local/bin/$script_name"
        
        # Create or update symlink
        if [ -L "$symlink" ] || [ -e "$symlink" ]; then
          rm -f "$symlink"
        fi
        
        ln -s "$script" "$symlink"
        chmod +x "$script"
        
        if [ "$GUM" -eq 1 ]; then
          echo "✓ Linked $script_name to ~/.local/bin"
        else
          echo "Linked $script_name to ~/.local/bin"
        fi
      fi
    done
  fi
fi

echo "Done."
