#!/bin/sh

# systray battery icon
cbatticon -u 5 &
# systray volume
#volumeicon &
# Configuracion de pantallas :

# only external display
xrandr --output eDP-1 --off --output HDMI-1 --primary --mode 1920x1080 --pos 0x0 --rotate normal &

# solo interna
# xrandr --output eDP-1 --primary --mode 1920x1080 --pos 0x0 --rotate normal --output HDMI-1 --off &

#picom (compositor para transparencias y efectos)
picom --experimental-backends -b &

dunst & #notification daemon
