import { Gtk } from "astal/gtk4"
import { Variable } from "astal"

const time = Variable("").poll(5000, () => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }
    const formattedTime = now.toLocaleDateString(undefined, options)
    return `󰃭  ${formattedTime.replace(",", ",").replace(" at ", "  󰥔 ")}`
})

export function TimeMenuButton() {
    return (
        <menubutton
        >
            <label label={time()} />
            <popover>
                <Gtk.Calendar />
            </popover>
        </menubutton>
    )
}