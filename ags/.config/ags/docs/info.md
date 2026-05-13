# Info

## Project stack (from files)

- Project name: `astal-shell`
- Entry: `app.ts`
- Main runtime imports: `astal/*` (GTK4/Astal APIs)
- `package.json` dependency:
  - `astal`: `/usr/share/astal/gjs`
- `package.json` devDependency:
  - `@girs/gtk-4.0`: `^4.18.3-4.0.0-beta.23`

## Local system state (detected)

- `ags` CLI: **missing**
- `gjs`: **missing**
- `node`: `v26.1.0`
- `npm`: **missing**
- `gtk4` package: `1:4.22.4-1.1`

## Notes

- This project expects AGS CLI and GJS to be installed.
- `./ags-shell` will fail fast with a clear error if `ags` is not present.
- Use `./ags-shell bundle` to produce a standalone executable script output.
