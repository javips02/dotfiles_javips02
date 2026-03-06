# i3 (and related)

This package contains my configuration for:
- i3 (window manager)
- i3status (status bar)
- i3blocks (optional, if present)

## To stow (dry run):

    stow -n -t "$HOME" i3

## To stow (real):

    stow -t "$HOME" i3

This will symlink:
- $HOME/.config/i3
- $HOME/.config/i3status
- $HOME/.config/i3blocks (if present)

## Notes

- For Linux/X11 systems using i3.
- If you have existing configs, back them up or use `stow --adopt` to bring them under Stow management.
- Edit files in this directory to update your config.
