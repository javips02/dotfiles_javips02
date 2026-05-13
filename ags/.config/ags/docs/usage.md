# Usage

This project is an AGS/Astal GTK4 shell entrypoint at `app.ts`.

## Prerequisites

- `ags` CLI available in `PATH`
- `gjs` runtime
- `npm` (used by `./ags-shell setup`/`run` to install local JS deps)

## First-time setup / repair

If modules are missing (for example `Could not resolve "astal/gtk4"`), run:

```bash
./ags-shell setup
```

This installs the local runtime dependencies (`astal` alias to AGS, `gnim`, and `sass`).

You can inspect everything the launcher needs with:

```bash
./ags-shell doctor
```

It also reports missing Astal GI namespaces (for example `AstalHyprland`).

## Run (development)

From the project root:

```bash
./ags-shell run
```

Equivalent direct command:

```bash
ags run --gtk 4 ./app.ts
```

`./ags-shell run` also auto-runs dependency setup when needed.

## Compile to executable

Create a bundled executable:

```bash
./ags-shell bundle
```

Default output is:

```text
~/.local/bin/ags-shell-bin
```

You can provide a custom output path:

```bash
./ags-shell bundle ~/.local/bin/my-shell
```

Run the compiled output:

```bash
~/.local/bin/ags-shell-bin
```

## Recommended Hyprland autostart

Use either the project launcher:

```ini
exec-once = ~/.config/ags/ags-shell run
```

or the compiled binary:

```ini
exec-once = ~/.local/bin/ags-shell-bin
```
