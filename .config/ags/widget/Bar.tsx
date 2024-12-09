import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import { Variable } from "astal"
import Battery from "gi://AstalBattery"

const time = Variable("").poll(1000, "date")
const battery = Battery.get_default()

export default function Bar(gdkmonitor: Gdk.Monitor) {
    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.LEFT
            | Astal.WindowAnchor.RIGHT}
        application={App}>
        <box orientation={Gtk.Orientation.HORIZONTAL}>
            {/* Caja izquierda */}
            <box>
                <button
                    onClicked={() => { /* Evento vacío */ }}
                    halign={Gtk.Align.START}>
                    <label label=" 󰣇 " />
                </button>
            </box>
			{/* Espaciador */}
            <box expand={true} />
			 {/* Monitor de batería */}
            <box>
                <label
					label={`BAT: ${battery.percentage*100} %`}
                />
            </box>
			 {/* Caja derecha */}
            <box>
                <button
                    onClick={() => print("hello")}
                    halign={Gtk.Align.END}>
                    <label label={time()} />
                </button>
            </box>
        </box>
    </window>
}

