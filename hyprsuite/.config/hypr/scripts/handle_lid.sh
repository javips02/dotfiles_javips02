#!/bin/bash

if [[ $1 == "open" ]]; then
  # Restore the internal panel and wake displays when the lid opens.
  hyprctl keyword monitor "eDP-1, 1920x1200@60, 0x0, 1, bitdepth, 10"
  hyprctl dispatch dpms on
elif [[ $1 == "close" ]]; then
  # Ensure the quickshell/noctalia lockscreen is running, otherwise start it.
  if command -v qs >/dev/null 2>&1; then
    if ! pgrep -f "qs -c noctalia-shell" >/dev/null 2>&1; then
      uwsm app -- qs -c noctalia-shell &
      sleep 0.2
    fi
    qs -c noctalia-shell ipc call lockScreen lock || true
  else
    # Fallback to hyprlock if qs isn't available.
    if command -v hyprlock >/dev/null 2>&1; then
      if ! pgrep -x hyprlock >/dev/null 2>&1; then
        hyprlock &
      fi
    fi
  fi

  # Do not disable eDP here: lid-open events can be missed across suspend.
  hyprctl dispatch dpms off

  # If logind is set to ignore lid events, this still suspends the machine.
  systemctl suspend
fi
