#!/bin/bash

is_lid_closed() {
  for lid_state in /proc/acpi/button/lid/*/state; do
    if [[ -r $lid_state ]] && grep -q 'state:[[:space:]]*closed' "$lid_state"; then
      return 0
    fi
  done
  return 1
}

external_monitor() {
  jq -r 'map(select(.name != "eDP-1" and .disabled != true))[0].name // empty'
}

set_internal_dpms() {
  hyprctl dispatch "hl.dsp.dpms({ action = \"$1\", monitor = \"eDP-1\" })"
}

if [[ $1 == "unlock" ]]; then
  monitors=$(hyprctl monitors -j) || exit 0
  if ! jq empty >/dev/null 2>&1 <<<"$monitors"; then
    exit 0
  fi

  if is_lid_closed && [[ -n $(external_monitor <<<"$monitors") ]]; then
    set_internal_dpms disable
  elif ! is_lid_closed; then
    set_internal_dpms enable
  fi
  exit
fi

if [[ $1 == "open" ]]; then
  # Ignore switch bounce: the kernel can emit an open event while ACPI still
  # reports the lid as closed. Keep clamshell mode in that case.
  sleep 1
  if is_lid_closed; then
    exec "$0" close
  fi

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

  external=$(external_monitor <<<"$monitors")
  if [[ -n $external ]]; then
    # Keep the laptop workspace reachable after its panel is powered off.
    hyprctl dispatch "hl.dsp.workspace.move({ workspace = \"1\", monitor = \"$external\" })"
    # In clamshell mode, turn off only the internal panel and keep the external output active.
    set_internal_dpms disable
  else
    hyprctl dispatch 'hl.dsp.dpms({ action = "disable" })'
    systemctl suspend
  fi
fi
