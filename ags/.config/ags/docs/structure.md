# Structure

## Top-level

- `app.ts`: main entrypoint, starts app and creates a `Bar` per monitor.
- `style.scss`: GTK styling for bar widgets.
- `env.d.ts`: type declarations for the project environment.
- `tsconfig.json`: TypeScript compiler settings.
- `package.json`: project metadata and dependencies.
- `ags-shell`: executable helper to run/bundle the shell.

## Widget modules

All widgets are in `widget/`:

- `Bar.tsx`: main bar container and layout
- `Workspaces.tsx`: workspace buttons/state
- `TimeMenuButton.tsx`: clock/time widget
- `Tray.tsx`: system tray area
- `Network.tsx`: network status widget
- `Volume.tsx`: volume + microphone widgets
- `Battery.tsx`: battery indicator
- `Performance.tsx`: CPU/RAM indicators
- `PowerMenu.tsx`: power actions entry
- `LogoButton.tsx`: launcher/logo button
- `Notifications.tsx`: notification-related widget code

## Runtime flow

1. `app.ts` imports `style.scss` and `Bar`.
2. `App.start(...)` initializes AGS/Astal.
3. `App.get_monitors().map(Bar)` spawns one bar window per monitor.
