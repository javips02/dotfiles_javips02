# AGS Shell Layer

A personalized shell layer built with AGS to provide a GNOME-like control experience on Hyprland.

## Language

**Arch Panel**:
The unified panel opened from the Arch button that groups shell controls and status.
_Avoid_: arch widget, popup hub, menu stack

**Audio Settings**:
The Arch Panel controls that expose speaker and microphone status plus direct audio actions.
_Avoid_: volume widget, hidden scroll controls

**Network Settings**:
The Arch Panel controls that show connection state and launch network management.
_Avoid_: network icon popup, quick wifi menu

**Power Actions**:
The Arch Panel actions for lock, shutdown, reboot, and wallpaper reload.
_Avoid_: power dropdown, top-bar power popup

**Power Profile**:
The active system power mode used by the machine.
_Avoid_: default mode, normal mode

**Balanced**:
The baseline power profile that applies when neither performance nor saver emphasis is active.
_Avoid_: default, normal

**Performance**:
A power profile prioritizing performance over power saving.
_Avoid_: turbo mode

**Power Saver**:
A power profile prioritizing lower power use over performance.
_Avoid_: eco mode, battery mode

**Now Playing**:
The currently active media track shown in the Arch Panel.
_Avoid_: spotify widget

**Player Selector**:
The Arch Panel control that chooses which media player receives transport commands.
_Avoid_: active app guess

**Transport Controls**:
The Now Playing actions for play/pause, next, and previous.
_Avoid_: media buttons

**User Identity**:
The session user presentation block consisting of display name and avatar.
_Avoid_: profile card, account tile

**Bluetooth Settings**:
The controls used to inspect or configure Bluetooth devices from the shell layer.
_Avoid_: bt menu

**Inline Pairing**:
Bluetooth pairing completed entirely inside the Arch Panel flow.
_Avoid_: automatic pairing

**Escalated Pairing**:
Bluetooth pairing flow handed off from Arch Panel to blueman-manager for PIN or passkey confirmation.
_Avoid_: fallback pairing

**Device Groups**:
The Bluetooth section list partitions devices into Connected, Paired, and Discovered groups.
_Avoid_: flat list

**Scan Session**:
A user-started Bluetooth discovery run that automatically stops after a fixed timeout.
_Avoid_: background scan

**Serialized Bluetooth Actions**:
A policy where only one Bluetooth operation runs at a time in the panel.
_Avoid_: parallel actions

## Relationships

- The **Arch Panel** presents controls and status for multiple shell features.
- The **Arch Panel** centralizes **Audio Settings**, **Network Settings**, and **Power Actions** so those controls are not duplicated in the top bar.
- A **Power Profile** is always exactly one of **Balanced**, **Performance**, or **Power Saver**.
- The battery module visually reflects the current **Power Profile**.
- The **Arch Panel** MVP includes **Power Profile**, **Now Playing**, **User Identity**, and **Bluetooth Settings** sections.
- **Bluetooth Settings** uses **Inline Pairing** for simple cases and **Escalated Pairing** for PIN/passkey confirmation cases.
- **Bluetooth Settings** presents **Device Groups** and runs a user-triggered **Scan Session** with a 15-second timeout.
- **Bluetooth Settings** enforces **Serialized Bluetooth Actions** and stops an active **Scan Session** before connect actions.
- **Now Playing** uses a **Player Selector** to target **Transport Controls** when multiple players exist.
- **Transport Controls** remain visible and disabled when no player is available.

## Example dialogue

> **Dev:** "Is the machine in default mode?"
> **Domain expert:** "Use **Balanced** as the canonical term. **Performance** and **Power Saver** are the other two **Power Profile** states."

## Flagged ambiguities

- "default" and "normal" were both used for the same concept — resolved as **Balanced**.
