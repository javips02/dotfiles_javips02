#!/bin/bash

echo "Comenzando actualizaciones..."
echo "Actualizando paquetería rpm con dnf:"
sudo dnf update
echo "Actualizando paquetería flatpak:"
flatpak update
