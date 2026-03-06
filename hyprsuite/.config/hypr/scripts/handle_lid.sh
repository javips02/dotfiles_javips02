#!/bin/bash

# Verifica si hay un monitor HDMI conectado
if [[ "$(hyprctl monitors)" == *"HDMI"* ]]; then
  if [[ $1 == "open" ]]; then
    # Al abrir la tapa, configura el monitor externo HDMI (1920x1080) arriba del interno eDP-1 (1920x1200)
	#hyprctl keyword monitor "HDMI-A-1,1920x1080@60,0,0,1,bitdepth,10"
    #hyprctl keyword monitor "eDP-1,1920x1200@60,0,1080,1,bitdepth,10"
	#Simplemente cargamos config de nuevo, sino error de sintaxis.
	hyprctl reload
  else
    # Al cerrar la tapa, desactivar el monitor interno eDP-1
    hyprctl keyword monitor "eDP-1,disable"
  fi
fi
