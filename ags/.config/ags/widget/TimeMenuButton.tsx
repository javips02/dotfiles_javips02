import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib?version=2.0"

function formatTime() {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }
    const formattedTime = now.toLocaleDateString(undefined, options)
    return `󰃭  ${formattedTime.replace(",", ",").replace(" at ", "  󰥔 ")}`
}

export function TimeMenuButton() {
    const button = Gtk.MenuButton.new()
    const label = Gtk.Label.new(formatTime())
    const popover = Gtk.Popover.new()

    popover.set_child(Gtk.Calendar.new())
    button.set_child(label)
    button.set_popover(popover)

    const sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
        label.set_label(formatTime())
        return true
    })

    button.connect("destroy", () => {
        GLib.Source.remove(sourceId)
    })

    return button
}
