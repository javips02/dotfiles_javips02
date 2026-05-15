import Battery from "gi://AstalBattery"
import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib"
import {
    type PowerProfile,
    getPowerProfileState,
    powerProfileToLabel,
    setPowerProfile,
    subscribePowerProfileChanged,
} from "./PowerProfile"

const PROFILE_CLASSES: readonly string[] = [
    "profile-balanced",
    "profile-performance",
    "profile-power-saver",
    "profile-unavailable",
]

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
        const state = getPowerProfileState()
        if (!state.available) {
            setProfileClass(button, null)
            status.set_label(`Current: Unavailable (${state.error})`)
            button.set_tooltip_text(`Power Profile: Unavailable (${state.error})`)
            setSelectorEnabled(false)
            return
        }

        setProfileClass(button, state.profile)
        status.set_label(`Current: ${powerProfileToLabel(state.profile)}`)
        button.set_tooltip_text(`Power Profile: ${powerProfileToLabel(state.profile)}`)
        setSelectorEnabled(true)
    }

    const applyProfile = (profile: PowerProfile) => {
        const result = setPowerProfile(profile)
        if (!result.ok) {
            status.set_label(`Current: Unavailable (${result.error || "failed to set profile"})`)
            setProfileClass(button, null)
            button.set_tooltip_text(`Power Profile: Unavailable (${result.error || "failed to set profile"})`)
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
    const unsubscribe = subscribePowerProfileChanged(refreshPowerProfile)

    button.connect("destroy", () => {
        GLib.Source.remove(timerId)
        unsubscribe()
    })

    return button
}
