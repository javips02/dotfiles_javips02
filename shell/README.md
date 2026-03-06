# shell

This package contains my shell configuration files:
- .bashrc
- .zshrc
# (add .profile, .bash_profile, etc. if desired)

## To stow (dry run):

    stow -n -t "$HOME" shell

## To stow (real):

    stow -t "$HOME" shell

This will symlink:
- $HOME/.bashrc
- $HOME/.zshrc
# (and any other shell dotfiles you add)

## Notes

- For Linux, macOS, or any system using bash or zsh.
- If you have existing configs, back them up or use `stow --adopt` to bring them under Stow management.
- Edit files in this directory to update your config.
