import Battery from "gi://AstalBattery"
import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib"
import Gio from "gi://Gio?version=2.0"

type PowerProfile = "balanced" | "performance" | "power-saver"

const PROFILE_CLASSES = [
    "profile-balanced",
    "profile-performance",
    "profile-power-saver",
    "profile-unavailable",
]

function runPowerProfilesctl(args: string[]): [boolean, string] {
    if (!GLib.find_program_in_path("powerprofilesctl")) {
        return [false, "powerprofilesctl not found in PATH"]
    }

    const command = Gio.Subprocess.new(
        ["powerprofilesctl", ...args],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE | Gio.SubprocessFlags.SEARCH_PATH,
    )
    const [, stdout, stderr] = command.communicate_utf8(null, null)
    if (!command.get_successful()) {
        return [false, (stderr || stdout || "powerprofilesctl failed").trim()]
    }
    return [true, (stdout || "").trim()]
}

function parseProfile(raw: string): PowerProfile | null {
    if (raw === "balanced" || raw === "performance" || raw === "power-saver") return raw
    return null
}

function profileToLabel(profile: PowerProfile): string {
    if (profile === "balanced") return "Balanced"
    if (profile === "performance") return "Performance"
    return "Power Saver"
}

function getActiveProfile(): [PowerProfile | null, string | null] {
    const [ok, output] = runPowerProfilesctl(["get"])
    if (!ok) return [null, output]
    const profile = parseProfile(output)
    if (!profile) return [null, `Unexpected profile: ${output}`]
    return [profile, null]
}

function setActiveProfile(profile: PowerProfile): [boolean, string | null] {
    const [ok, message] = runPowerProfilesctl(["set", profile])
    if (!ok) return [false, message]
    return [true, null]
}

function setProfileClass(widget: Gtk.Widget, profile: PowerProfile | null) {
    PROFILE_CLASSES.forEach((name) => widget.remove_css_class(name))
    if (profile === "performance") widget.add_css_class("profile-performance")
    else if (profile === "power-saver") widget.add_css_class("profile-power-saver")
    else if (profile === "balanced") widget.add_css_class("profile-balanced")
    else widget.add_css_class("profile-unavailable")
}

export function Battery_icon() {
    const battery = Battery.get_default()

    // Main button content
    const button = Gtk.MenuButton.new()
    button.add_css_class("battery-module")
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6)
    const image = Gtk.Image.new_from_icon_name("battery-symbolic")
    const label = Gtk.Label.new("Loading...")

    box.append(image)
    box.append(label)
    button.set_child(box)

    // Popover profile selector
    const popover = Gtk.Popover.new()
    const popoverBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 6)
    popover.set_child(popoverBox)

    const title = Gtk.Label.new("Power Profile")
    title.set_xalign(0)
    popoverBox.append(title)

    const status = Gtk.Label.new("Current: Loading...")
    status.set_xalign(0)
    popoverBox.append(status)

    const buttons = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    popoverBox.append(buttons)

    const profileButtons: Record<PowerProfile, Gtk.Button> = {
        balanced: Gtk.Button.new_with_label("Balanced"),
        performance: Gtk.Button.new_with_label("Performance"),
        "power-saver": Gtk.Button.new_with_label("Power Saver"),
    }

    buttons.append(profileButtons.balanced)
    buttons.append(profileButtons.performance)
    buttons.append(profileButtons["power-saver"])
    button.set_popover(popover)

    // Update battery status display
    const updateBatteryStatus = () => {
        const percentage = Math.round(battery.percentage * 100)
        label.set_label(`${percentage}%`)
        image.set_from_icon_name(battery.icon_name || "battery-symbolic")
    }

    const setSelectorEnabled = (enabled: boolean) => {
        profileButtons.balanced.set_sensitive(enabled)
        profileButtons.performance.set_sensitive(enabled)
        profileButtons["power-saver"].set_sensitive(enabled)
    }

    const refreshPowerProfile = () => {
        const [profile, error] = getActiveProfile()
        if (!profile) {
            setProfileClass(button, null)
            status.set_label(`Current: Unavailable (${error || "powerprofilesctl not ready"})`)
            button.set_tooltip_text(`Power Profile: Unavailable (${error || "powerprofilesctl not ready"})`)
            setSelectorEnabled(false)
            return
        }

        setProfileClass(button, profile)
        status.set_label(`Current: ${profileToLabel(profile)}`)
        button.set_tooltip_text(`Power Profile: ${profileToLabel(profile)}`)
        setSelectorEnabled(true)
    }

    const applyProfile = (profile: PowerProfile) => {
        const [ok, error] = setActiveProfile(profile)
        if (!ok) {
            status.set_label(`Current: Unavailable (${error || "failed to set profile"})`)
            setProfileClass(button, null)
            button.set_tooltip_text(`Power Profile: Unavailable (${error || "failed to set profile"})`)
            return
        }
        refreshPowerProfile()
    }

    profileButtons.balanced.connect("clicked", () => applyProfile("balanced"))
    profileButtons.performance.connect("clicked", () => applyProfile("performance"))
    profileButtons["power-saver"].connect("clicked", () => applyProfile("power-saver"))

    popover.connect("show", refreshPowerProfile)

    // Initial update
    updateBatteryStatus()
    refreshPowerProfile()

    // Keep battery and profile states up to date
    const timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10000, () => {
        updateBatteryStatus()
        refreshPowerProfile()
        return true
    })

    button.connect("destroy", () => {
        GLib.Source.remove(timerId)
    })

    return button
}
