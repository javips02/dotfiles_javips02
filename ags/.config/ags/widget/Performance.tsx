import GLib from "gi://GLib"
import { Gtk } from "astal/gtk4"

function readFile(path: string): string {
    const [ok, bytes] = GLib.file_get_contents(path)
    if (!ok) return ""
    return new TextDecoder().decode(bytes)
}

function getRamUsage(): number {
    const data = readFile("/proc/meminfo")
    const lines = data.split("\n")
    const memTotal = parseInt(lines.find(l => l.startsWith("MemTotal"))?.match(/\d+/)?.[0] || "0", 10)
    const memAvailable = parseInt(lines.find(l => l.startsWith("MemAvailable"))?.match(/\d+/)?.[0] || "0", 10)
    if (memTotal === 0) return 0
    return Math.round(((memTotal - memAvailable) / memTotal) * 100)
}

let lastCpuIdle = 0
let lastCpuTotal = 0

function getCpuUsage(): number {
    const data = readFile("/proc/stat")
    const cpuLine = data.split("\n")[0] ?? ""
    const values = cpuLine.split(/\s+/).slice(1, 8).map(Number)
    if (values.length < 4 || values.some(Number.isNaN)) return 0

    const idle = values[3]
    const total = values.reduce((a, b) => a + b, 0)
    if (lastCpuTotal === 0) {
        lastCpuIdle = idle
        lastCpuTotal = total
        return 0
    }

    const deltaIdle = idle - lastCpuIdle
    const deltaTotal = total - lastCpuTotal
    lastCpuIdle = idle
    lastCpuTotal = total

    if (deltaTotal <= 0) return 0
    return Math.round(100 * (1 - deltaIdle / deltaTotal))
}

export function Ram_icon() {
    const button = Gtk.Button.new()
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6)
    const image = Gtk.Image.new_from_icon_name("memory-symbolic")
    const label = Gtk.Label.new("0%")

    box.append(image)
    box.append(label)
    button.set_child(box)

    const updateRamLabel = () => {
        label.set_label(`${getRamUsage()}%`)
        return true
    }

    updateRamLabel()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, updateRamLabel)
    button.connect("clicked", updateRamLabel)

    return button
}

export function Cpu_icon() {
    const button = Gtk.Button.new()
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6)
    const image = Gtk.Image.new_from_icon_name("cpu-symbolic")
    const label = Gtk.Label.new("0%")

    box.append(image)
    box.append(label)
    button.set_child(box)

    const updateCpuLabel = () => {
        label.set_label(`${getCpuUsage()}%`)
        return true
    }

    updateCpuLabel()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, updateCpuLabel)
    button.connect("clicked", updateCpuLabel)

    return button
}
