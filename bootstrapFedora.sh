#!/bin/bash

# Script to install TPM (Tmux Plugin Manager) and set up tmux configuration

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
sudo dnf install polkit-gnome gnome-keyring qt5-qtwayland qt6-qtwayland mako xdg-desktop-portal-hyprland hyprpaper waybar hypridle
