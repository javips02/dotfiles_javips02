import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { PowerMenu } from "./PowerMenu"
import { TimeMenuButton } from "./TimeMenuButton"
import { LogoButton } from "./LogoButton"
import { Workspaces } from "./Workspaces"
import { Battery_icon } from "./Battery"
import { Volume_icon, Mic } from "./Volume"
import { Network_icon } from "./Network"
import { Ram_icon, Cpu_icon } from "./Performance"
import { Tray_icon } from "./Tray"


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
            margin_top={0}
            margin_bottom={0}
        >
            <centerbox cssName="centerbox">
                <box>
                    {[<Workspaces/>]}
                </box>
                <box>
                    {[<TimeMenuButton />]}
                </box>
                <box>
                    <Tray_icon />
                    < Cpu_icon />
                    < Ram_icon />
                    <Network_icon />
                    <Mic />
                    <Volume_icon />
                    <Battery_icon />
                    <PowerMenu />
                    <LogoButton />
                </box>
            </centerbox>
        </window>
    )
}
