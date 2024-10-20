#!/bin/bash

# Script to install TPM (Tmux Plugin Manager) and set up tmux configuration

# Variable for build directories
builddirs=~/buildsJavito

# Set up tmux
TMUX_CONF="$HOME/.tmux.conf"
TPM_DIR="$HOME/.tmux/plugins/tpm"

# Function to check if TPM is already installed
if [ ! -d "$TPM_DIR" ]; then
    echo "Cloning TPM into $TPM_DIR"
    git clone https://github.com/tmux-plugins/tpm "$TPM_DIR"
    echo "TPM installed successfully."
else
    echo "TPM is already installed."
fi
echo "To install plugins, open tmux and press 'Ctrl + b' followed by 'I'."

# Install hyprland deps
sudo dnf update
sudo dnf install gnome-keyring qt5-qtwayland qt6-qtwayland mako xdg-desktop-portal-hyprland hyprpaper waybar hypridle xwaylandvideobridge grim slurp NetworkManager-tui cmake qt5-qtbase-devel qt5-qtdeclarative-devel polkit-devel gcc-c++

### HYPRPOLKIT SECTION ###
# DNF deps
sudo dnf install qt6-qtbase-devel qt6-qtquickcontrols2-devel qt6-qtdeclarative-devel pkgconf-pkg-config polkit-qt6-1-devel

# Install hyprutils (dependency for hyprpolkit)
mkdir -p "$builddirs/hyprutils"
git clone https://github.com/hyprwm/hyprutils.git "$builddirs/hyprutils"
cd "$builddirs/hyprutils"
cmake --no-warn-unused-cli -DCMAKE_BUILD_TYPE:STRING=Release -DCMAKE_INSTALL_PREFIX:PATH=/usr -S . -B ./build
cmake --build ./build --config Release --target all -j$(nproc 2>/dev/null || getconf _NPROCESSORS_CONF)
sudo cmake --install build

# Install hyprpolkit
mkdir -p "$builddirs/hyprpolkit"
git clone https://github.com/hyprwm/hyprpolkitagent.git "$builddirs/hyprpolkit"
cd "$builddirs/hyprpolkit"
mkdir build && cd build
cmake .. && make && sudo make install

# Install hyprshot (for screenshots)
mkdir -p "$builddirs/hyprshot"
git clone https://github.com/Gustash/hyprshot.git "$builddirs/hyprshot"
ln -s "$builddirs/hyprshot/hyprshot" ~/.local/bin/hyprshot
chmod +x "$builddirs/hyprshot/hyprshot"
