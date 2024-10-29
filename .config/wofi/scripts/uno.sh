#!/bin/bash

case "$(echo -e "🔊 Volumen\n🎙 Volumen del Micrófono\n🌞 Brillo\n🎧 Fuente de Audio\n🔋 Batería\n👤 Usuario Actual\n🎵 Spotify" | wofi --dmenu)" in
    "🔊 Volumen") ~/.config/wofi/scripts/volume.sh ;;
    "🎙 Volumen del Micrófono") ~/.config/wofi/scripts/mic_volume.sh ;;
    "🌞 Brillo") ~/.config/wofi/scripts/brightness.sh ;;
    "🎧 Fuente de Audio") ~/.config/wofi/scripts/audio_source.sh ;;
    "🔋 Batería") ~/.config/wofi/scripts/battery.sh ;;
    "👤 Usuario Actual") ~/.config/wofi/scripts/user.sh ;;
    "🎵 Spotify") ~/.config/wofi/scripts/spotify.sh ;;
    *) exit 1 ;;
esac
