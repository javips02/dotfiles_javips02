# Terminal configs

Stow this package with `stow -n -t "$HOME" terminal`, then
`stow -t "$HOME" terminal` after reviewing the preview.

## Kitty and the Azure icon

`bash stow-apply.sh macos` and `bash stow-apply.sh linux` install Kitty if
missing and apply the Azure icon automatically after Stow.

To install Kitty and apply just its icon without stowing other packages:

```bash
bash kitty-setup.sh macos  # macOS: Homebrew cask
bash kitty-setup.sh linux  # Linux: apt, dnf, pacman, or zypper
```

Existing Kitty installations are reused. Linux package installation may request
sudo. Unsupported distributions must install Kitty first, then rerun the script.

The Stow-managed `kitty.app.icns` and `kitty.app.png` are loaded by Kitty on
startup. The setup script also sets the macOS application bundle's custom icon
and restarts the current user's Dock (without quitting Kitty or deleting shared
caches). Reopen Kitty to refresh existing windows. Rerun after an application
upgrade if Finder/Dock revert to the original icon.
The custom icon uses Finder metadata and a resource fork: normal code-signature
verification still passes, but `codesign --verify --strict` rejects that metadata.

On Linux, setup creates a user-local `kitty.desktop` override with the Azure
icon, preserving existing launcher options when available. Changed icons and
user launchers are backed up before replacement. Some Wayland compositors do not
support custom window icons; the application launcher still uses Azure. The
script honors `KITTY_CONFIG_DIRECTORY`, `XDG_CONFIG_HOME`, and `XDG_DATA_HOME`.

## Icon attribution

The unmodified **Neue Azure** assets are by **k0nserv**, from
[k0nserv/kitty-icon](https://github.com/k0nserv/kitty-icon), commit
`7f631a61bcbdfb268cdf1c97992a5c077beec9d6`:

- `build/neue_azure.icns` -> `.config/kitty/kitty.app.icns`
- `build/neue_azure.iconset/icon_512x512.png` -> `.config/kitty/kitty.app.png`

Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
The upstream license and warranty disclaimer are available at
[LICENSE](https://github.com/k0nserv/kitty-icon/blob/7f631a61bcbdfb268cdf1c97992a5c077beec9d6/LICENSE).
