import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { PowerMenu } from "./PowerMenu"
import { TimeMenuButton } from "./TimeMenuButton"
import { LogoButton } from "./LogoButton"
import { Workspaces } from "./Workspaces"
import { SysTray } from "./SysTray"

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
            <box>
                <LogoButton />
                <Workspaces />
            </box>
            <TimeMenuButton />
             <box>
                <SysTray />
                <PowerMenu />
             </box>
        </centerbox>
    </window>
}
