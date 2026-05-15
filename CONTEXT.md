# AGS Shell Layer

A personalized shell layer built with AGS to provide a GNOME-like control experience on Hyprland.

## Language

**Arch Panel**:
The unified panel opened from the Arch button that groups shell controls and status.
_Avoid_: arch widget, popup hub, menu stack

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

**User Identity**:
The session user presentation block consisting of display name and avatar.
_Avoid_: profile card, account tile

**Bluetooth Settings**:
The controls used to inspect or configure Bluetooth devices from the shell layer.
_Avoid_: bt menu

## Relationships

- The **Arch Panel** presents controls and status for multiple shell features.
- A **Power Profile** is always exactly one of **Balanced**, **Performance**, or **Power Saver**.
- The battery module visually reflects the current **Power Profile**.
- The **Arch Panel** MVP includes **Power Profile**, **Now Playing**, **User Identity**, and **Bluetooth Settings** sections.

## Example dialogue

> **Dev:** "Is the machine in default mode?"
> **Domain expert:** "Use **Balanced** as the canonical term. **Performance** and **Power Saver** are the other two **Power Profile** states."

## Flagged ambiguities

- "default" and "normal" were both used for the same concept — resolved as **Balanced**.
