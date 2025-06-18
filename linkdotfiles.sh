#!/bin/bash

DOTFILES_CONFIG="$HOME/.dotfiles/.config"
TARGET_CONFIG="$HOME/.config"

# Crear carpeta .config si no existe
mkdir -p "$TARGET_CONFIG"

# Iterar sobre todos los elementos en ~/.dotfiles/.config
for item in "$DOTFILES_CONFIG"/*; do
    name=$(basename "$item")
    target="$TARGET_CONFIG/$name"

    # Verifica si ya existe y NO es un symlink: lo mueve como backup
    if [ -e "$target" ] && [ ! -L "$target" ]; then
        echo "⚠️  $target ya existe, creando backup en ${target}.backup"
        mv "$target" "${target}.backup"
    fi

    # Borra symlink si ya existe
    if [ -L "$target" ]; then
        rm "$target"
    fi

    # Crear symlink
    ln -s "$item" "$target"
    echo "✅ Enlace creado: $target -> $item"
done

