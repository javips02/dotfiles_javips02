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
#yay -S sdm
#sudo systemctl enable gdm
#Hyprland ecosistem
yay -S hyprland gnome-keyring qt5-wayland qt6-wayland mako xdg-desktop-portal-hyprland hyprshot waybar hypridle xwayland hyprpaper networkmanager qt5-base qt5-declarative qt6-base qt6-quickcontrols2 qt6-declarative ttf-jetbrains-mono-nerd wofi gnome-themes-extra hyprlock brightnessctl hyprland-qtutils
#polkit
yay -S hyprpolkitagent-git 
# Widgets (build eww with wayland support thorough cargo --> rust compiler)
#yay -S aylurs-gtk-shell-git eslint --noconfirm
#For battery module
#yay -S meson vala json-glib gobject-introspection
#(
#git clone https://github.com/aylur/astal.git
#cd astal/lib/battery
#meson setup --prefix /usr build
#meson install -C build
#)
#(
#cd astal/lib/hyprland
#meson setup --prefix /usr build
#meson install -C build
#)
# Development Utils #
yay -S jetbrains-toolbox visual-studio-code-bin qemu-full virt-manager libvirt swtpm docker virtiofsd
sudo systemctl enable libvirtd docker containerd
sudo usermod -aG qemu libvirt docker javi
yay -S neovim npm lua unzip
# Flatpak section #
yay -S flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak remote-add --if-not-exists --user launcher.moe https://gol.launcher.moe/gol.launcher.moe.flatpakrepo
flatpak install org.gnome.Platform//45
flatpak install launcher.moe moe.launcher.the-honkers-railway-launcher
flatpak install com.github.tchx84.Flatseal com.jgraph.drawio.desktop com.mattjakeman.ExtensionManager com.mudeprolinux.whakarere com.spotify.Client io.github.gamingdoom.Datcord md.obsidian.Obsidian org.gnome.seahorse.Application 

# User packages
# starship
curl -sS https://starship.rs/install.sh | sh
# Archivos y rendimiento
yay -S megasync-bin bashtop fastfetch nnn
# Ahorro bateria portatil
yay -S tlp tlp-rdw 
sudo systemctl enable tlp && sudo systemctl start tlp
sudo cp ./tlpconfig /etc/default/tlp
# Office
yay -S libreoffice-fresh
yay -S zathura zathura-pdf-mupdf 
# Fonts
yay -S ttf-clear-sans
# Codecs
yay -S x265 libde265 libvpx dav1d


# Link all .dotfiles configs to their dirs (.config mainly)
#stow -R --override="--force" .
