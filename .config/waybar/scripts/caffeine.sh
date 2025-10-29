#!/bin/sh

state_file="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/caffeine.state"

notify() {
  command -v notify-send >/dev/null 2>&1 || return 0
  notify-send -a "Caffeine" "Caffeine: $1" -t 2000
}

toggle() {
  if [ -f "$state_file" ]; then
    rm -f "$state_file"
    notify "off"
  else
    mkdir -p "$(dirname "$state_file")"
    printf '%s\n' on > "$state_file"
    notify "on"
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
