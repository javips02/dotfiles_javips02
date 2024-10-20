#!bin/bash
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

#Greeter
yay -S greetd-tuigreet-bin
sudo systemctl enable 
#Hyprland ecosistem
yay -S gnome-keyring qt5-wayland qt6-wayland mako xdg-desktop-portal-hyprland hyprshot waybar hypridle xwayland hyprpaper networkmanager qt5-base qt5-declarative qt6-base qt6-quickcontrols2 qt6-declarative
#polkit
yay -S hyprpolkitagent-git

