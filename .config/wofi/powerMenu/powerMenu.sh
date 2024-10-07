#!/bin/bash

# Define la ruta completa al comando systemctl
SYSTEMCTL=/usr/bin/systemctl

case "$1" in
    Block)
        # Aquí puedes añadir el comando para bloquear la pantalla si lo deseas.
        ;;
    Shutdown)
        $SYSTEMCTL poweroff
        ;;
    "Log Out")
        # Aquí puedes añadir el comando para cerrar sesión.
        ;;
    Suspend)
        $SYSTEMCTL suspend
        ;;
    *)
        exit 1
        ;;
esac
