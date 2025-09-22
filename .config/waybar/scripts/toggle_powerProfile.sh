#!/bin/sh

current=$(powerprofilesctl get)

case "$current" in
  performance)
    next="balanced"
    ;;
  balanced)
    next="power-saver"
    ;;
  power-saver)
    next="performance"
    ;;
  *)
    next="balanced"
    ;;
esac

# Si se ha invocado con argumento "set", cambia el perfil
if [ "$1" = "set" ]; then
  powerprofilesctl set "$next"
fi

# Devuelve JSON para waybar
profile=$(powerprofilesctl get)
echo "{\"text\":\"$profile\",\"alt\":\"$profile\"}"
