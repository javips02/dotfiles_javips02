import { Gtk } from "astal/gtk4"

export function LogoButton() {
    return (
        <button
            onClicked="echo hello"
            hexpand
            halign={Gtk.Align.CENTER}
        >
            󰣇  Arch
        </button>
    )
}