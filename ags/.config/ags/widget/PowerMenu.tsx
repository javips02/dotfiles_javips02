import Gio from "gi://Gio?version=2.0"
import { Gtk } from "astal/gtk4"

function runCommand(argv: string[]) {
    Gio.Subprocess.new(argv, Gio.SubprocessFlags.NONE)
}

export function PowerMenu(): JSX.Element {
    const menuButton = Gtk.MenuButton.new()
    menuButton.add_css_class("power-menu")
    menuButton.set_child(Gtk.Label.new("󰤆"))

    const popover = Gtk.Popover.new()
    popover.add_css_class("action-popover")
    const box = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0)
    popover.set_child(box)

    const mkButton = (label: string, onClick: () => void) => {
        const button = Gtk.Button.new()
        button.set_child(Gtk.Label.new(label))
        button.connect("clicked", onClick)
        box.append(button)
    }

    mkButton(" 󰌾 Lock", () => runCommand(["hyprlock"]))
    mkButton("  Shutdown", () => runCommand(["/usr/bin/systemctl", "poweroff"]))
    mkButton("  Reboot", () => runCommand(["/usr/bin/systemctl", "reboot"]))
    mkButton("  Reload Wallpaper", () =>
        runCommand([
            "sh",
            "-c",
            "if pgrep -x hyprpaper > /dev/null; then killall hyprpaper && hyprpaper & disown; else hyprpaper & disown; fi",
        ]),
    )

    menuButton.set_popover(popover)
    return menuButton
}
