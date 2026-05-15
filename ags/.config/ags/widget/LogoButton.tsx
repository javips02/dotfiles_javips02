import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib?version=2.0"
import {
    type PowerProfile,
    getPowerProfileState,
    powerProfileToLabel,
    setPowerProfile,
    subscribePowerProfileChanged,
} from "./PowerProfile"
import { getNowPlayingState } from "./NowPlaying"

function findAvatarPath(): string | null {
    const configured = GLib.getenv("AGS_ARCH_AVATAR_PATH")
    if (configured && GLib.file_test(configured, GLib.FileTest.EXISTS)) return configured

    const home = GLib.get_home_dir()
    const fallbacks = [`${home}/.face`, `${home}/.face.icon`]
    return fallbacks.find((path) => GLib.file_test(path, GLib.FileTest.EXISTS)) || null
}

export function LogoButton() {
    const button = Gtk.MenuButton.new()
    button.set_child(Gtk.Label.new("󰣇  Arch"))
    button.add_css_class("arch-panel-trigger")

    const popover = Gtk.Popover.new()
    popover.add_css_class("arch-panel-popover")
    const root = Gtk.Box.new(Gtk.Orientation.VERTICAL, 8)
    root.add_css_class("arch-panel")
    popover.set_child(root)

    const heading = Gtk.Label.new("Arch Panel")
    heading.set_xalign(0)
    heading.add_css_class("arch-panel-title")
    root.append(heading)

    const subtitle = Gtk.Label.new("GNOME-like shell controls (MVP)")
    subtitle.set_xalign(0)
    subtitle.add_css_class("arch-panel-subtitle")
    root.append(subtitle)

    const makeSection = (titleText: string, initialText: string) => {
        const section = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
        section.add_css_class("arch-panel-section")

        const title = Gtk.Label.new(titleText)
        title.set_xalign(0)
        title.add_css_class("arch-panel-section-title")
        section.append(title)

        const body = Gtk.Label.new(initialText)
        body.set_xalign(0)
        body.set_wrap(true)
        body.add_css_class("arch-panel-section-body")
        section.append(body)

        root.append(section)
        return body
    }

    const powerProfileSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    powerProfileSection.add_css_class("arch-panel-section")
    const powerProfileTitle = Gtk.Label.new("Power Profile")
    powerProfileTitle.set_xalign(0)
    powerProfileTitle.add_css_class("arch-panel-section-title")
    powerProfileSection.append(powerProfileTitle)
    const powerProfileBody = Gtk.Label.new("Current: Loading...")
    powerProfileBody.set_xalign(0)
    powerProfileBody.add_css_class("arch-panel-section-body")
    powerProfileSection.append(powerProfileBody)

    const powerButtonRow = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 4)
    powerButtonRow.add_css_class("arch-panel-option-row")
    const powerButtons: Record<PowerProfile, Gtk.Button> = {
        balanced: Gtk.Button.new_with_label("Balanced"),
        performance: Gtk.Button.new_with_label("Performance"),
        "power-saver": Gtk.Button.new_with_label("Power Saver"),
    }
    powerButtonRow.append(powerButtons.balanced)
    powerButtonRow.append(powerButtons.performance)
    powerButtonRow.append(powerButtons["power-saver"])
    powerProfileSection.append(powerButtonRow)
    root.append(powerProfileSection)

    const nowPlayingBody = makeSection("Now Playing", "Unavailable - section not wired yet")

    const userSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    userSection.add_css_class("arch-panel-section")
    const userTitle = Gtk.Label.new("User Identity")
    userTitle.set_xalign(0)
    userTitle.add_css_class("arch-panel-section-title")
    userSection.append(userTitle)
    const userRow = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 8)
    userRow.add_css_class("arch-user-row")
    const userAvatar = Gtk.Image.new_from_icon_name("avatar-default-symbolic")
    userAvatar.set_pixel_size(32)
    userRow.append(userAvatar)
    const userText = Gtk.Box.new(Gtk.Orientation.VERTICAL, 2)
    const userName = Gtk.Label.new("Loading user...")
    userName.set_xalign(0)
    userName.add_css_class("arch-panel-section-body")
    const userAvatarState = Gtk.Label.new("Avatar: checking...")
    userAvatarState.set_xalign(0)
    userAvatarState.add_css_class("arch-panel-section-body")
    userText.append(userName)
    userText.append(userAvatarState)
    userRow.append(userText)
    userSection.append(userRow)
    root.append(userSection)

    const bluetoothBody = makeSection("Bluetooth Settings", "Unavailable - section not wired yet")

    const setPowerButtonsEnabled = (enabled: boolean) => {
        powerButtons.balanced.set_sensitive(enabled)
        powerButtons.performance.set_sensitive(enabled)
        powerButtons["power-saver"].set_sensitive(enabled)
    }

    const refreshPowerProfileSection = () => {
        const state = getPowerProfileState()
        if (!state.available) {
            powerProfileBody.set_label(`Current: Unavailable (${state.error})`)
            setPowerButtonsEnabled(false)
            return
        }

        powerProfileBody.set_label(`Current: ${powerProfileToLabel(state.profile)}`)
        setPowerButtonsEnabled(true)
    }

    const applyProfile = (profile: PowerProfile) => {
        const result = setPowerProfile(profile)
        if (!result.ok) {
            powerProfileBody.set_label(`Current: Unavailable (${result.error || "failed to set profile"})`)
            setPowerButtonsEnabled(false)
            return
        }
        refreshPowerProfileSection()
    }

    powerButtons.balanced.connect("clicked", () => applyProfile("balanced"))
    powerButtons.performance.connect("clicked", () => applyProfile("performance"))
    powerButtons["power-saver"].connect("clicked", () => applyProfile("power-saver"))

    const refreshUserIdentitySection = () => {
        const username = GLib.get_user_name() || "Unknown user"
        userName.set_label(username)

        const avatarPath = findAvatarPath()
        if (avatarPath) {
            userAvatar.set_from_file(avatarPath)
            userAvatarState.set_label(`Avatar: ${avatarPath}`)
            return
        }

        userAvatar.set_from_icon_name("avatar-default-symbolic")
        userAvatarState.set_label("Avatar unavailable (set AGS_ARCH_AVATAR_PATH or ~/.face)")
    }

    const refreshPanel = () => {
        const stamp = GLib.DateTime.new_now_local()?.format("%H:%M:%S") || "unknown time"
        refreshPowerProfileSection()
        const nowPlaying = getNowPlayingState()
        if (nowPlaying.available) {
            nowPlayingBody.set_label(nowPlaying.text)
        } else {
            nowPlayingBody.set_label(`Unavailable (${nowPlaying.error})`)
        }
        refreshUserIdentitySection()
        bluetoothBody.set_label(`Unavailable - section not wired yet (checked ${stamp})`)
    }

    let refreshTimer: number | null = null
    popover.connect("show", () => {
        refreshPanel()
        if (refreshTimer !== null) return
        refreshTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
            refreshPanel()
            return true
        })
    })

    popover.connect("hide", () => {
        if (refreshTimer === null) return
        GLib.Source.remove(refreshTimer)
        refreshTimer = null
    })
    const unsubscribe = subscribePowerProfileChanged(refreshPowerProfileSection)

    button.connect("destroy", () => {
        if (refreshTimer !== null) GLib.Source.remove(refreshTimer)
        unsubscribe()
    })

    button.set_popover(popover)
    return button
}
