import Hyprland from "gi://AstalHyprland"
import { Gtk } from "astal/gtk4"

export function Workspaces() {
    const hypr = Hyprland.get_default()
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6)
    const buttons: Gtk.Button[] = []

    const renderWorkspaces = () => {
        buttons.forEach(button => box.remove(button))
        buttons.length = 0

        const focused = hypr.focusedWorkspace
        const workspaces = hypr.workspaces
            .filter(ws => !(ws.id >= -99 && ws.id <= -2))
            .sort((a, b) => a.id - b.id)

        workspaces.forEach(ws => {
            const button = Gtk.Button.new_with_label(`${ws.id}`)
            if (ws === focused) button.add_css_class("focused")
            button.connect("clicked", () => ws.focus())
            box.append(button)
            buttons.push(button)
        })
    }

    hypr.connect("notify::workspaces", renderWorkspaces)
    hypr.connect("notify::focused-workspace", renderWorkspaces)
    renderWorkspaces()

    return box
}
