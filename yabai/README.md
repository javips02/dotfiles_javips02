# yabai (and friends)

This package contains my configuration for:
- yabai (tiling window manager for macOS)
- skhd (hotkey daemon)
- sketchybar (status bar)

## To stow (dry run):

    stow -n -t "$HOME" yabai

## To stow (real):

    stow -t "$HOME" yabai

This will symlink:
- $HOME/.yabairc
- $HOME/.config/yabai
- $HOME/.config/skhd
- $HOME/.config/sketchybar

## Notes

- For macOS only.
- If you have existing configs, back them up or use `stow --adopt` to bring them under Stow management.
- Edit files in this directory to update your config.
