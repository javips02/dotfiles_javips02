# sway

This package contains my Sway window manager configuration.

## To stow (dry run):

    stow -n -t "$HOME" sway

## To stow (real):

    stow -t "$HOME" sway

- Symlinks sway config to $HOME/.config/sway
- For Linux/Wayland systems using Sway

## Notes

- Edit files in this directory to update your config.
- If you have existing $HOME/.config/sway, back it up or use `stow --adopt` if needed.
