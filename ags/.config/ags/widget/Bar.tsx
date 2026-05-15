import { Astal, Gdk } from "astal/gtk4"
import Gtk from "gi://Gtk?version=4.0"
import { PowerMenu } from "./PowerMenu"
import { TimeMenuButton } from "./TimeMenuButton"
import { LogoButton } from "./LogoButton"
import { Workspaces } from "./Workspaces"
import { Battery_icon } from "./Battery"
import { Volume_icon, Mic } from "./Volume"
import { Network_icon } from "./Network"
import { Ram_icon, Cpu_icon } from "./Performance"
import { Tray_icon } from "./Tray"


export default function Bar(gdkmonitor: Gdk.Monitor, application: Gtk.Application) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    const { START, CENTER, END } = Gtk.Align

    return (
        <window
            visible
            cssClasses={["Bar"]}
            gdkmonitor={gdkmonitor}
            application={application}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            margin_top={0}
            margin_bottom={0}
        >
            <box cssName="centerbox" hexpand>
                <box halign={START} hexpand>
                    <box cssClasses={["island"]}>
                        <Workspaces />
                    </box>
                </box>
                <box halign={CENTER} hexpand>
                    <box cssClasses={["island"]}>
                        <TimeMenuButton />
                    </box>
                </box>
                <box halign={END} hexpand>
                    <box cssClasses={["island"]}>
                        <Tray_icon />
                    </box>
                    <box cssClasses={["island"]}>
                        <Cpu_icon />
                    </box>
                    <box cssClasses={["island"]}>
                        <Ram_icon />
                    </box>
                    <box cssClasses={["island"]}>
                        <Network_icon />
                    </box>
                    <box cssClasses={["island"]}>
                        <Mic />
                    </box>
                    <box cssClasses={["island"]}>
                        <Volume_icon />
                    </box>
                    <box cssClasses={["island"]}>
                        <Battery_icon />
                    </box>
                    <box cssClasses={["island"]}>
                        <PowerMenu />
                    </box>
                    <box cssClasses={["island"]}>
                        <LogoButton />
                    </box>
                </box>
            </box>
        </window>
    )
}
