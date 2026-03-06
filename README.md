# Dotfiles

This repository contains my modular, Stow-managed dotfiles for Linux and macOS systems.

## Structure
- Each application or suite has its own directory (Stow package).
- Packages are grouped logically (e.g., hyprsuite, wmmacos, shell, terminal, bar, notifications).
- Each package contains a README with usage and stow instructions.
- Non-config files and documentation are ignored via `.stow-local-ignore`.

## How to Use

1. **Clone this repo:**
   ```bash
   git clone --recursive <repo-url> ~/.dotfiles
   cd ~/.dotfiles
   ```

2. **Preview what will be symlinked (dry run):**
   ```bash
   stow -n -t "$HOME" <package>
   # e.g. stow -n -t "$HOME" nvim
   ```

3. **Apply the symlinks:**
   ```bash
   stow -t "$HOME" <package>
   # e.g. stow -t "$HOME" nvim
   ```

4. **For grouped configs:**
   - Some packages (e.g., hyprsuite, wmmacos, bar, notifications, terminal, shell) manage multiple related configs at once.
   - Review each package's README for details and OS-specific notes.

## Adding New Configs
- Create a new directory for the app or group.
- Place config files inside the appropriate .config/ subfolder (or as dotfiles for $HOME).
- Add a README.md and update `.stow-local-ignore` if needed.

## Notes
- Use `stow -n` before every real stow to check for conflicts.
- If you have existing configs, back them up or use `stow --adopt` to bring them under Stow management.
- This repo is designed to be clean, extensible, and easy to maintain.

---

Happy hacking!
