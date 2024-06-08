#!/bin/bash
# Script que instala las dependencias para ejecutar todos los programas de los dotfiles
# Instalar gestor paquetes homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalación de paquetes con brew
brew install kitty gcc git make fastfetch neovim starship obsidian spotify android-studio whisky canva calibre docker docker-compose colima mactex-no-gui discord brave-browser megasync

