#!/bin/bash

# Ruta para el archivo temporal que guarda el idioma actual
LAYOUT_FILE="/tmp/current_kb_layout"

# Si el archivo no existe, crea uno con el valor inicial "es"
if [ ! -f "$LAYOUT_FILE" ]; then
    echo "es" > "$LAYOUT_FILE"
fi

# Lee el idioma actual
CURRENT_LAYOUT=$(cat "$LAYOUT_FILE")

# Alterna el idioma
if [ "$CURRENT_LAYOUT" = "es" ]; then
    NEW_LAYOUT="us"
else
    NEW_LAYOUT="es"
fi

# Aplica el nuevo idioma al teclado
hyprctl setxkbmap "$NEW_LAYOUT"

# Guarda el nuevo idioma
echo "$NEW_LAYOUT" > "$LAYOUT_FILE"

