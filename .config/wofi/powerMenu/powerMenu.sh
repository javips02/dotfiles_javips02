#!/bin/bash

# Define la ruta completa al comando systemctl
SYSTEMCTL=/usr/bin/systemctl

# Comprueba que se pase un argumento
if [ -z "$1" ]; then
    exit 1
fi

case "$1" in
    Block)
        hyprlock
        ;;
    Shutdown)
        $SYSTEMCTL poweroff
        ;;
    "Log Out")
        # Puedes cambiar esto por el comando para cerrar sesión que uses
        $SYSTEMCTL reboot  # Cambiar a logout si es necesario
        ;;
    Suspend)
        $SYSTEMCTL suspend
        ;;
    *)
        exit 1
        ;;
esac
