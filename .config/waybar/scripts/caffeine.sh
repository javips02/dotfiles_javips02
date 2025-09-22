#!/bin/sh

state_file="/tmp/caffeine.state"

toggle() {
  if [ -f "$state_file" ]; then
    # Desactivar
    rm -f "$state_file"
  else
    # Activar
    echo "on" > "$state_file"
  fi
}

status() {
  if [ -f "$state_file" ]; then
    echo '{"text":"on","alt":"on"}'
  else
    echo '{"text":"off","alt":"off"}'
  fi
}

case "$1" in
  toggle) toggle ;;
esac

status
