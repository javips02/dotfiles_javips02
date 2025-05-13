import { App, Astal, Gtk, Gdk } from "astal/gtk4"
import { PowerMenu } from "./PowerMenu"
import { TimeMenuButton } from "./TimeMenuButton"
import { LogoButton } from "./LogoButton"
import { Workspaces } from "./Workspaces"

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return (
        <window
            visible
            cssClasses={["Bar"]}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={App}
        >
            <box orientation="horizontal">
                <box>
                    <LogoButton />
                </box>
                <box>
                    <Workspaces />
                </box>
                <box>
                    <TimeMenuButton />
                    <PowerMenu />
                </box>
            </box>
        </window>
    )
}
