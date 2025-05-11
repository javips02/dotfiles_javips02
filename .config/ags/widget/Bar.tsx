import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { Variable } from "astal"
import { PowerMenu } from "./PowerMenu"

const time = Variable("").poll(1000, "date")

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        visible
        cssClasses={["Bar"]}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <centerbox cssName="centerbox">
            <button
                onClicked="echo hello"
                hexpand
                halign={Gtk.Align.CENTER}
            >
                󰣇  Arch
            </button>
            <menubutton
                hexpand
                halign={Gtk.Align.CENTER}
            >
                <label label={time()} />
                <popover>
                    <Gtk.Calendar />
                </popover>
            </menubutton>
            <PowerMenu />
        </centerbox>
    </window>
}
