#!/bin/bash

#wallpaper
feh --bg-fill /home/javi/Imágenes/walpapers/mirrorsEdge.png &

#statusbar
dwmblocks &

#networking
nm-applet &

#syncthing
syncthingtray &

#picom
picom &

exec dwm
