import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { PowerMenu } from "./PowerMenu"
import { TimeMenuButton } from "./TimeMenuButton"
import { LogoButton } from "./LogoButton"
import { Workspaces } from "./Workspaces"
import { Battery_icon } from "./Battery"
import { Volume_icon, Mic } from "./Volume"

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    const { IGNORE } = Astal.Exclusivity
    const { EXCLUSIVE } = Astal.Keymode
    const { CENTER } = Gtk.Align

    return (
        <window
            visible
            cssClasses={["Bar"]}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={App}
        >
            <centerbox cssName="centerbox">
                <box>
                    {[<LogoButton />]}
                </box>
                <box>
                    {[<Workspaces />]}
                </box>
                <box>
                    <Mic />
                    <Volume_icon />
                    <Battery_icon />
                    <TimeMenuButton />
                    <PowerMenu />
                </box>
            </centerbox>
        </window>
    )
}
