# dwmconfig (dwm, dwmblocks, etc.)

This package contains my configuration and scripts for:
- dwm (dynamic window manager)
- dwmblocks (status bar)
- dwminit.sh, dwm.desktop, and related files

## To stow (dry run):

    stow -n -t "$HOME" dwmconfig

## To stow (real):

    stow -t "$HOME" dwmconfig

This will symlink:
- $HOME/.config/dwm/dwm
- $HOME/.config/dwm/dwmblocks
- $HOME/.config/dwm/dwminit.sh
- $HOME/.config/dwm/dwm.desktop
- (and any other related files)

## Notes

- For Linux/X11 systems using dwm.
- If you have existing configs, back them up or use `stow --adopt` to bring them under Stow management.
- Edit files in this directory to update your config.
