#!/bin/bash
# Script que instala las dependencias para ejecutar todos los programas de los dotfiles
# Instalar gestor paquetes homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalación de paquetes con brew
brew install kitty gcc git make fastfetch neovim starship obsidian spotify android-studio whisky canva calibre docker docker-compose colima mactex-no-gui discord brave-browser megasync arc stow tldr ripgrep

# Poner los dotfiles en su sitio con gnu stow
# Simulación del comando Stow
echo "Simulando la aplicación de configuraciones con Stow:"
stow --simulate -R --override="--force" .
# Preguntar al usuario si quiere proceder con la operación real
read -p "¿Quieres proceder con la aplicación real de las configuraciones? (s/n): " respuesta
if [[ "$respuesta" == "s" ]]; then
    # Aplicación real del comando Stow
    echo "Aplicando configuraciones con Stow:"
    stow -R --override="--force" .
    echo "Configuraciones aplicadas con éxito."
else
    echo "Operación cancelada por el usuario."
fi

