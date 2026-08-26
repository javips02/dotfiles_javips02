# Hyprland conf → Lua parity checklist

Tracking tasks needed to match `hyprland.conf` functionality in `hyprland.lua`.

- **Status legend:** `[x] done` · `[ ] pending`

- [x] Fix Lua syntax blockers in generated config (invalid table keys like `col.active`, invalid identifiers like `power-menu`, invalid `class.*` key).
- [x] Restore full `animations` content from `hyprland.conf` (`bezier` and all `animation = ...` entries).
- [x] Fix broken modifier bind composition (`$mainMod+SHIFT/...` strings in Lua) to proper Lua-composed modifiers.
- [x] Fix numeric key concatenation in binds (`.. 0/1/2 ...`) by using string keys (`"0".."9"`).
- [x] Normalize screenshot key naming to `Print` variants for parity with `.conf`.
- [x] Reuse declared command variables (`terminal`, `browser`, `fileManager`, `menu`, `lockScreen`, `obsidian`, `powerMenu`) in binds for consistency.

- [x] Port all TODO-marked `window_rule` directives to explicit Lua equivalents:
  - `suppress_event maximize`
  - `float on` with `size ...` + `center on` for Spotify/Gnome Software/Nautilus
  - XWayland rules: `no_anim on`, `no_initial_focus on`, `max_size 1 1`, `no_blur on`
- [ ] Validate the Lua `window_rule` API shape against the `hl` module docs/source to avoid silently wrong rule generation.
- [ ] Confirm startup/reload behavior parity (`exec-once`/`exec` in `.conf` vs `hl.on("hyprland.start")` and `hl.on("config.reloaded")` in Lua) in a live Hyprland session.

## Pending checks

- [ ] **Window-rule runtime check:** run Hyprland and verify each migrated rule applies as expected (`suppress_event`, floating/size/center, xwayland bridge rules).
- [ ] **Startup parity check:** verify on fresh session start that Noctalia shell, `allow_session_lock_restore`, and `hypridle` all launch once.
- [ ] **Reload parity check:** run `hyprctl reload` and verify `gsettings ... color-scheme "prefer-dark"` executes on reload.
