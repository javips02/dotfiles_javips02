#!/bin/bash
# Script que instala las dependencias para ejecutar todos los programas de los dotfiles
# Instalar gestor paquetes homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Listas con descripciones

# Herramientas generales
tools_general=(
	"fastfetch  # Herramienta para mostrar información del sistema"
	"neovim  # Editor de texto avanzado"
	"starship  # Prompt minimalista para la terminal"
	"obsidian  # Herramienta de toma de notas"
	"spotify  # Cliente de Spotify"
	"android-studio  # IDE para desarrollo de Android"
	"whisky  # Emulador de Windows para macOS"
	"canva  # Herramienta de diseño gráfico"
	"calibre  # Gestión de libros electrónicos"
	"discord  # Plataforma de comunicación"
	"megasync  # Cliente de sincronización para MEGA"
)

# Generar lista consolidada sin comentarios
echo "Instalando paquetes generales"
packages=$(for package in "${tools_general[@]}"; do echo "${package%%[[:space:]]*#*}"; done)
brew install "$packages"

# Dependencias de desarrollo a nivel de sistema
dev_dependencies=(
	"bash  # Shell de Bash"
	"git  # Sistema de control de versiones"
	"make  # Herramienta de construcción"
	"docker  # Plataforma de contenedores"
	"docker-compose  # Herramienta para definir y ejecutar aplicaciones Docker multi-contenedor"
	"colima  # Contenedores en macOS con Docker"
	"stow  # Gestor de dotfiles"
	"tldr  # Páginas de manual simplificadas"
	"ripgrep  # Herramienta de búsqueda en línea de comandos"
	"mactex-no-gui  # Distribución TeX para macOS sin GUI"
	"eslint # paquete para linters en nvim"
)

echo "Instalando paquetes de desarrollo"
packages=$(for package in "${dev_dependencies[@]}"; do echo "${package%%[[:space:]]*#*}"; done)
brew install "$packages"


# Dependencias para lenguajes de programación (desarrollo y funcionamiento de nvim)
language_dependencies=(
	"gcc  # Compilador para C y C++"
	"lua  # Intérprete para Lua"
	"luarocks  # Administrador de paquetes para Lua"
	"python  # Intérprete para Python"
	"openjdk  # Kit de desarrollo de Java"
	"ruby  # Intérprete para Ruby"
	"node  # Entorno para JavaScript"
	"wget  # Herramienta de descarga"
	"curl  # Herramienta de transferencia de datos"
	"unzip  # Herramienta de descompresión"
	"cmake  # Herramienta de generación de sistemas de construcción"
	"ninja  # Herramienta de construcción de alto rendimiento"
	"jq  # Procesador de JSON"
	"rust  # Lenguaje de programación Rust"
	"go  # Lenguaje de programación Go"
	"php  # Lenguaje de programación PHP"
	"composer  # Administrador de dependencias para PHP"
)

echo "Instalando paquetes de lenguaje y compilación"
packages=$(for package in "${language_dependencies[@]}"; do echo "${package%%[[:space:]]*#*}"; done)
brew install "$packages"


# Poner los dotfiles en su sitio con gnu stow
# Simulación del comando Stow
echo "Simulando la aplicación de configuraciones con Stow:"
stow --simulate -R --override="--force" .
# Preguntar al usuario si quiere proceder con la operación real
read -rp "¿Quieres proceder con la aplicación real de las configuraciones? (s/n): " respuesta
if [[ "$respuesta" == "s" ]]; then
    # Aplicación real del comando Stow
    echo "Aplicando configuraciones con Stow:"
    stow -R --override="--force" .
    echo "Configuraciones aplicadas con éxito."
else
    echo "Operación cancelada por el usuario."
fi

