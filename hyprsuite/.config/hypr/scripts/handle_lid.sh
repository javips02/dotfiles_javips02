#!/bin/bash

if [[ $1 == "unlock" ]]; then
  lid_closed=false
  for lid_state in /proc/acpi/button/lid/*/state; do
    if [[ -r $lid_state ]] && grep -q 'state:[[:space:]]*closed' "$lid_state"; then
      lid_closed=true
      break
    fi
  done

  if [[ $lid_closed == true ]]; then
    monitors=$(hyprctl monitors -j) || exit 0
    if jq -e 'any(.[]; .name != "eDP-1" and .disabled != true)' >/dev/null 2>&1 <<<"$monitors"; then
      hyprctl dispatch 'hl.dsp.dpms({ action = "off", monitor = "eDP-1" })'
    fi
  fi
  exit
fi

if [[ $1 == "open" ]]; then
  # Restore the internal panel and wake displays when the lid opens.
  hyprctl dispatch 'hl.dsp.dpms({ action = "on", monitor = "eDP-1" })'
  hyprctl dispatch 'hl.dsp.workspace.move({ workspace = "1", monitor = "eDP-1" })'
elif [[ $1 == "close" ]]; then
  # Keep the session running in clamshell mode when an external output is active.
  monitors=$(hyprctl monitors -j) || {
    echo "Unable to query Hyprland monitors; suspending for safety." >&2
    systemctl suspend
    exit
  }

  if ! jq empty >/dev/null 2>&1 <<<"$monitors"; then
    echo "Hyprland returned invalid monitor data; suspending for safety." >&2
    systemctl suspend
    exit
  fi

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

  if jq -e 'any(.[]; .name != "eDP-1" and .disabled != true)' >/dev/null 2>&1 <<<"$monitors"; then
    # Keep the laptop workspace reachable after its panel is powered off.
    hyprctl dispatch 'hl.dsp.workspace.move({ workspace = "1", monitor = "DP-3" })'
    # In clamshell mode, turn off only the internal panel and keep the external output active.
    hyprctl dispatch 'hl.dsp.dpms({ action = "off", monitor = "eDP-1" })'
  else
    hyprctl dispatch 'hl.dsp.dpms({ action = "off" })'
    systemctl suspend
  fi
fi
