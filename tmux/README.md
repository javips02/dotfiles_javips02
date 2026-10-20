# tmux

This package contains my tmux configuration.

## To stow (dry run):

    stow -n -t "$HOME" tmux

## To stow (real):

    stow -t "$HOME" tmux

- Symlinks tmux config to $HOME/.tmux.conf.
- `./stow-apply.sh macos` also installs tmux with Homebrew when needed, clones
  TPM, and installs the plugins declared in the configuration.
- For Linux, macOS, or any system using tmux

## Notes

- Edit tmux/.tmux.conf in this directory to update your config.
- If you have an existing $HOME/.tmux.conf, back it up or use `stow --adopt` to bring it under Stow management.

# Notes on tmux
##  Intro
A terminal multiplexer allows for:
- Session persistence
- Organization of spaces
- Navigation between "terminals" with a better layout than just terminal emulator tabs

## Hierarchy of contexts
- Session -> Highest level, one per project
- Window -> Task level, in coding would be "editor", "logs", "terminal", "docker", "git"...
- Pane -> sub-task level, are terminals that share screen space in real time

## Managing Sessions
Don't just type tmux to enter tmux. Give names to the sessions:
Create session:
```shell
tmux new -s my-project #Starts a new session named "my-project"
# also leader + s with this config as shortcut
```

Detach/reatach to session:
```shell
# Detach
leader + d
# Re-attach (tab completion available)
tmux attach -t my-project
```

## Managing workflow inside sessions
Command,Action
Ctrl-a + I (Capital i),Install newly declared plugins through TPM (the macOS bootstrap does this automatically).
Ctrl-a + c,Create a new Window.
Ctrl-a + n / p,Move to Next or Previous window.
Ctrl-a + + / -,Split panes (based on your custom config).
Ctrl-a + Ctrl-s,Save your session layout (via tmux-resurrect).
Ctrl-a + Ctrl-r,Restore your sessions after a computer reboot.

