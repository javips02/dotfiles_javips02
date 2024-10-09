#!/bin/bash

# Verifica si hay un monitor HDMI conectado
if [[ "$(hyprctl monitors)" == *"HDMI"* ]]; then
  if [[ $1 == "open" ]]; then
    # Al abrir la tapa, configura el monitor externo HDMI (1920x1080) arriba del interno eDP-1 (1920x1200)
    #hyprctl keyword monitor "eDP-1,1920x1200,0,1080,1"   # Interno debajo
	hyprctl keyword monitor "eDP-1,preferred,auto,1"
  else
    # Al cerrar la tapa, desactivar el monitor interno eDP-1
    hyprctl keyword monitor "eDP-1,disable"
  fi
fi
