#!/bin/bash
sudo dnf update

sudo dnf install polkit-kde qt5-qtwayland qt6-qtwayland mako xdg-desktop-portal-hyprland hyprpaper waybar hypridle

# Make vscode use wayland
sudo sed -i 's|^Exec=.*|Exec=env WAYLAND_DISPLAY=wayland-0 code --ozone-platform=wayland %U|' /usr/share/applications/code.desktop

systemctl --user enable ~/.config/systemd/user/hyprlock-on-resume.service
