import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib?version=2.0"

export function LogoButton() {
    const button = Gtk.MenuButton.new()
    button.set_child(Gtk.Label.new("󰣇  Arch"))
    button.add_css_class("arch-panel-trigger")

    const popover = Gtk.Popover.new()
    popover.add_css_class("arch-panel-popover")
    const root = Gtk.Box.new(Gtk.Orientation.VERTICAL, 8)
    root.add_css_class("arch-panel")
    popover.set_child(root)

    const heading = Gtk.Label.new("Arch Panel")
    heading.set_xalign(0)
    heading.add_css_class("arch-panel-title")
    root.append(heading)

    const subtitle = Gtk.Label.new("GNOME-like shell controls (MVP)")
    subtitle.set_xalign(0)
    subtitle.add_css_class("arch-panel-subtitle")
    root.append(subtitle)

    const makeSection = (titleText: string, initialText: string) => {
        const section = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
        section.add_css_class("arch-panel-section")

        const title = Gtk.Label.new(titleText)
        title.set_xalign(0)
        title.add_css_class("arch-panel-section-title")
        section.append(title)

        const body = Gtk.Label.new(initialText)
        body.set_xalign(0)
        body.add_css_class("arch-panel-section-body")
        section.append(body)

        root.append(section)
        return body
    }

    const powerProfileBody = makeSection("Power Profile", "Unavailable - section not wired yet")
    const nowPlayingBody = makeSection("Now Playing", "Unavailable - section not wired yet")
    const userIdentityBody = makeSection("User Identity", "Unavailable - section not wired yet")
    const bluetoothBody = makeSection("Bluetooth Settings", "Unavailable - section not wired yet")

    const refreshPanel = () => {
        const stamp = GLib.DateTime.new_now_local()?.format("%H:%M:%S") || "unknown time"
        powerProfileBody.set_label(`Unavailable - section not wired yet (checked ${stamp})`)
        nowPlayingBody.set_label(`Unavailable - section not wired yet (checked ${stamp})`)
        userIdentityBody.set_label(`Unavailable - section not wired yet (checked ${stamp})`)
        bluetoothBody.set_label(`Unavailable - section not wired yet (checked ${stamp})`)
    }

    let refreshTimer: number | null = null
    popover.connect("show", () => {
        refreshPanel()
        if (refreshTimer !== null) return
        refreshTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
            refreshPanel()
            return true
        })
    })

    popover.connect("hide", () => {
        if (refreshTimer === null) return
        GLib.Source.remove(refreshTimer)
        refreshTimer = null
    })

    button.set_popover(popover)
    return button
}
