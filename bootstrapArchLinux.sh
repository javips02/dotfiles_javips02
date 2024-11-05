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
yay -S ly
sudo systemctl enable ly
#Hyprland ecosistem
yay -S hyprland gnome-keyring qt5-wayland qt6-wayland mako xdg-desktop-portal-hyprland hyprshot waybar hypridle xwayland hyprpaper networkmanager qt5-base qt5-declarative qt6-base qt6-quickcontrols2 qt6-declarative ttf-jetbrains-mono-nerd wofi gnome-themes-extra hyprlock brightnessctl
#polkit
yay -S hyprpolkitagent-git
# Widgets (build eww with wayland support thorough cargo --> rust compiler)
yay -S rustup
mkdir -p ~/.local/bin
git clone https://github.com/elkowar/eww /tmp/eww
cd /tmp/eww && cargo build --release --no-default-features --features=wayland && chmod +x /tmp/eww/target/release/eww && cp /tmp/eww/target/release/eww ~/.local/bin/eww

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
yay -S megasync-bin bashtop fastfetch nautilus
# Ahorro bateria portatil
yay -S tlp tlp-rdw 
sudo systemctl enable tlp && sudo systemctl start tlp
sudo cp ./tlpconfig /etc/default/tlp
# PDF
yay -S zathura
# Office
yay -S libreoffice-fresh
yay -S zathura zathura-pdf-mupdf 
# Fonts
yay -S ttf-meslo-nerd



# Link all .dotfiles configs to their dirs (.config mainly)
stow -R --override="--force" .
