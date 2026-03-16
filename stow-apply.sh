#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"

if ! command -v stow >/dev/null 2>&1; then
  echo "Error: GNU Stow is required but was not found in PATH." >&2
  exit 2
fi

backup_path() {
  local path="$1"
  local backup="${path}.backup.$(date +%Y%m%d%H%M%S)"

  echo "Backing up $path to $backup"
  mv "$path" "$backup"
}

resolve_path() {
  local path="$1"

  if [ -d "$path" ]; then
    (
      cd -P -- "$path"
      pwd -P
    )
    return
  fi

  (
    cd -P -- "$(dirname -- "$path")"
    printf '%s/%s\n' "$(pwd -P)" "$(basename -- "$path")"
  )
}

resolve_symlink_target() {
  local path="$1"
  local target=""

  target="$(readlink "$path")" || return 1

  if [[ "$target" = /* ]]; then
    resolve_path "$target"
    return
  fi

  (
    cd -P -- "$(dirname -- "$path")"
    resolve_path "$target"
  )
}

repair_repo_symlink_conflicts() {
  local pkg="$1"
  local relpath=""
  local target=""
  local expected=""
  local actual=""

  while IFS= read -r relpath; do
    if [[ "$relpath" != */* ]]; then
      continue
    fi

    target="$HOME/$relpath"

    if [ ! -L "$target" ]; then
      continue
    fi

    expected="$(resolve_path "$SCRIPT_DIR/$pkg/$relpath")"
    actual="$(resolve_symlink_target "$target")"

    if [[ "$actual" == "$SCRIPT_DIR"/* ]] && [ "$actual" != "$expected" ]; then
      echo "Found stale repo symlink for $relpath: $target -> $actual"
      backup_path "$target"
    fi
  done < <(
    find "$pkg" -mindepth 1 \
      ! -path '*/README.md' \
      ! -path '*/README.*' \
      ! -path '*/LICENSE' \
      ! -name '*.md' \
      ! -name '.DS_Store' \
      -print | sed "s#^$pkg/##" | sort -u
  )
}

run_stow_preview() {
  local pkg="$1"
  local preview_file="$2"
  local exit_code=0

  set +e
  stow -n -v --ignore='(^|/).*\.md$' -t "$HOME" "$pkg" 2>&1 | tee "$preview_file"
  exit_code=${PIPESTATUS[0]}
  set -e

  return "$exit_code"
}

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
    preview_file="$(mktemp "/tmp/stow-preview-${pkg}.XXXXXX")"

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
    repair_repo_symlink_conflicts "$pkg"

    preview_failed=0
    if ! run_stow_preview "$pkg" "$preview_file"; then
      preview_failed=1
    fi

    if [ "$preview_failed" -eq 1 ] && ! grep -qE 'existing|conflict|cannot stow|over existing target' "$preview_file"; then
      echo "Error: stow preview failed unexpectedly for $pkg. Skipping."
      rm -f "$preview_file"
      continue
    fi

    # Check for potential conflicts (lines with 'existing' or 'WARNING')
      if grep -qE 'existing|conflict|cannot stow|over existing target' "$preview_file"; then
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
        grep -Eo 'over existing target [^ ]+' "$preview_file" | awk '{print $4}' | while read -r f; do
          if [ -e "$f" ]; then
            backup_path "$f"
          fi
        done
        # Also handle 'existing' lines (for completeness)
        grep 'existing' "$preview_file" | awk '{print $NF}' | while read -r f; do
          if [ -e "$f" ] || [ -L "$f" ]; then
            backup_path "$f"
          fi
        done
        # Rerun stow preview to ensure conflicts are resolved
        echo "Re-running stow preview for $pkg after backup/removal..."
        preview_failed=0
        if ! run_stow_preview "$pkg" "$preview_file"; then
          preview_failed=1
        fi
        if [ "$preview_failed" -eq 1 ] || grep -qE 'cannot stow|conflict|existing|over existing target' "$preview_file"; then
          echo "Conflicts still remain for $pkg after backup/removal. Skipping."
          rm -f "$preview_file"
          continue
        fi
        echo "Stowing $pkg (with backup)..."
        stow --ignore='(^|/).*\.md$' -t "$HOME" "$pkg"
    else
      if [ "$GUM" -eq 1 ]; then
        gum confirm "No conflicts for $pkg. Proceed with stow?" || { echo "Skipping $pkg."; continue; }
        echo "Stowing $pkg..."
        stow --ignore='(^|/).*\.md$' -t "$HOME" "$pkg"
      else
        read -r -p "No conflicts for $pkg. Proceed with stow? [y/N]: " confirm
        case "$confirm" in
          [Yy]*)
            echo "Stowing $pkg..."
            stow --ignore='(^|/).*\.md$' -t "$HOME" "$pkg"
            ;;
          *)
            echo "Skipping $pkg."
            ;;
        esac
      fi
    fi
    rm -f "$preview_file"
  else
    echo "Warning: package $pkg does not exist, skipping."
  fi
done

# --- Post-stow setup for macOS ---
if [ "$1" = "macos" ]; then
  # Create ~/.local/bin if it doesn't exist
  mkdir -p "$HOME/.local/bin"
  
  # Symlink shell bin scripts to ~/.local/bin
  if [ -d "$SCRIPT_DIR/shell/bin" ]; then
    for script in "$SCRIPT_DIR/shell/bin"/*; do
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
