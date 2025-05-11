import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { PowerMenu } from "./PowerMenu"
import { TimeMenuButton } from "./TimeMenuButton"
import { LogoButton } from "./LogoButton"

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
            <LogoButton />
            <TimeMenuButton />
            <PowerMenu />
        </centerbox>
    </window>
}
