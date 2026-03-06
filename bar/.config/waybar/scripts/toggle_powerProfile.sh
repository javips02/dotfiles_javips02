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
  # Envía una notificación con el perfil al que cambiamos
  case "$next" in
    performance) label="Performance";;
    balanced)    label="Balanced";;
    power-saver) label="Power saver";;
    *)           label="$next";;
  esac
  notify-send --expire-time=1200 "Power profile" "Switched to: $label"
fi

# Devuelve JSON para waybar
profile=$(powerprofilesctl get)
echo "{\"text\":\"$profile\",\"alt\":\"$profile\"}"
