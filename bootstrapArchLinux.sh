#!/bin/bash
#update system
sudo pacman -Syu
# install dep adn creat euser directories
sudo pacman -S xdg-user-dirs
xdg-user-dirs-update

# install yay 
sudo pacman -S --needed git base-devel
git clone https://aur.archlinux.org/yay.git /tmp/yay
cd /tmp/yay
makepkg -si

# first setup for yay (only run once!)
yay -Y --gendb
yay -Syu --devel
yay -Y --devel --save

#Greeter
yay -S greetd-tuigreet-bin
sudo systemctl enable 
#Hyprland ecosistem
yay -S gnome-keyring qt5-wayland qt6-wayland mako xdg-desktop-portal-hyprland hyprshot waybar hypridle xwayland hyprpaper networkmanager qt5-base qt5-declarative qt6-base qt6-quickcontrols2 qt6-declarative
#polkit
yay -S hyprpolkitagent-git

# Development Utils #
yay -S jetbrains-toolbox

# Flatpak section #
yay -S flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak remote-add --if-not-exists --user launcher.moe https://gol.launcher.moe/gol.launcher.moe.flatpakrepo
flatpak install org.gnome.Platform//45
flatpak install launcher.moe moe.launcher.the-honkers-railway-launcher
flatpak install com.github.tchx84.Flatseal com.jgraph.drawio.desktop com.mattjakeman.ExtensionManager com.mudeprolinux.whakarere com.spotify.Client io.github.gamingdoom.Datcord md.obsidian.Obsidian org.gnome.seahorse.Application 
