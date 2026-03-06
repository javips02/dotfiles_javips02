# tmux

This package contains my tmux configuration.

## To stow (dry run):

    stow -n -t "$HOME" tmux

## To stow (real):

    stow -t "$HOME" tmux

- Symlinks tmux config to $HOME/.tmux.conf
- For Linux, macOS, or any system using tmux

## Notes

- Edit tmux/.tmux.conf in this directory to update your config.
- If you have an existing $HOME/.tmux.conf, back it up or use `stow --adopt` to bring it under Stow management.
