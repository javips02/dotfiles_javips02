#! /bin/bash

# Permisos de sudo para que no los pida luego
echo "------------------------------"
echo "COMENZANDO LAS ACTUALIZACIONES"
echo "------------------------------"
# Actualizar paquetes de brew
echo "******************************"
echo "*    Paquetes de brew:       *"
echo "******************************"
#  yabai --stop-service
/opt/homebrew/bin/brew upgrade
#  yabai --start-service

#Actualizacion de los macports
#echo "******************************"
#echo "*   Paquetes de Macports:    *"
#echo "******************************"
#sudo port selfupdate
#sudo port upgrade outdated
