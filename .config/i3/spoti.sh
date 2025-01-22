#!/usr/bin/env bash
#echo $(dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:org.mpris.MediaPlayer2.Player string:Metadata | sed -n '/title/{n;p}' | cut -d '"' -f 2) >  /home/javi/.config/i3/current_song
echo  $2 ﴁ $3 > /home/javi/.config/i3/current_song

