import { Gtk } from "astal/gtk4"
import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
import Network from "gi://AstalNetwork"
import Wp from "gi://AstalWp"
import {
    type PowerProfile,
    getPowerProfileState,
    powerProfileToLabel,
    setPowerProfile,
    subscribePowerProfileChanged,
} from "./PowerProfile"
import {
    getNowPlayingSectionState,
    runNowPlayingTransport,
    selectNextPlayer,
    selectPreviousPlayer,
} from "./NowPlaying"
import {
    type BluetoothDevice,
    canLaunchBluemanManager,
    connectBluetoothDevice,
    disconnectBluetoothDevice,
    getBluetoothDeviceGroupsState,
    getBluetoothOperationState,
    getBluetoothScanSessionState,
    getBluetoothSummaryState,
    launchBluemanManager,
    pairBluetoothDevice,
    startBluetoothScanSession,
    stopBluetoothScanSession,
    subscribeBluetoothOperationChanged,
} from "./BluetoothService"

function findAvatarPath(): string | null {
    const configured = GLib.getenv("AGS_ARCH_AVATAR_PATH")
    if (configured && GLib.file_test(configured, GLib.FileTest.EXISTS)) return configured

    const home = GLib.get_home_dir()
    const fallbacks = [`${home}/.face`, `${home}/.face.icon`]
    return fallbacks.find((path) => GLib.file_test(path, GLib.FileTest.EXISTS)) || null
}

function runCommand(argv: string[]) {
    Gio.Subprocess.new(argv, Gio.SubprocessFlags.NONE)
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

    const audioSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    audioSection.add_css_class("arch-panel-section")
    const audioTitle = Gtk.Label.new("Audio Settings")
    audioTitle.set_xalign(0)
    audioTitle.add_css_class("arch-panel-section-title")
    audioSection.append(audioTitle)
    const speakerStatus = Gtk.Label.new("Speaker: Loading...")
    speakerStatus.set_xalign(0)
    speakerStatus.add_css_class("arch-panel-section-body")
    audioSection.append(speakerStatus)
    const speakerControls = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 4)
    speakerControls.add_css_class("arch-panel-option-row")
    const speakerDown = Gtk.Button.new_with_label("Vol -")
    const speakerToggleMute = Gtk.Button.new_with_label("Toggle Mute")
    const speakerUp = Gtk.Button.new_with_label("Vol +")
    speakerControls.append(speakerDown)
    speakerControls.append(speakerToggleMute)
    speakerControls.append(speakerUp)
    audioSection.append(speakerControls)
    const micStatus = Gtk.Label.new("Mic: Loading...")
    micStatus.set_xalign(0)
    micStatus.add_css_class("arch-panel-section-body")
    audioSection.append(micStatus)
    const micToggleMute = Gtk.Button.new_with_label("Toggle Mic Mute")
    audioSection.append(micToggleMute)
    root.append(audioSection)

    const networkSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    networkSection.add_css_class("arch-panel-section")
    const networkTitle = Gtk.Label.new("Network Settings")
    networkTitle.set_xalign(0)
    networkTitle.add_css_class("arch-panel-section-title")
    networkSection.append(networkTitle)
    const networkBody = Gtk.Label.new("Status: Loading...")
    networkBody.set_xalign(0)
    networkBody.set_wrap(true)
    networkBody.add_css_class("arch-panel-section-body")
    networkSection.append(networkBody)
    const networkAction = Gtk.Button.new_with_label("Open Network Manager")
    networkSection.append(networkAction)
    root.append(networkSection)

    const powerActionsSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    powerActionsSection.add_css_class("arch-panel-section")
    const powerActionsTitle = Gtk.Label.new("Power Actions")
    powerActionsTitle.set_xalign(0)
    powerActionsTitle.add_css_class("arch-panel-section-title")
    powerActionsSection.append(powerActionsTitle)
    const powerActionsRow = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 4)
    powerActionsRow.add_css_class("arch-panel-option-row")
    const lockButton = Gtk.Button.new_with_label("󰌾 Lock")
    const shutdownButton = Gtk.Button.new_with_label(" Shutdown")
    const rebootButton = Gtk.Button.new_with_label(" Reboot")
    const reloadWallpaperButton = Gtk.Button.new_with_label(" Reload Wallpaper")
    powerActionsRow.append(lockButton)
    powerActionsRow.append(shutdownButton)
    powerActionsRow.append(rebootButton)
    powerActionsSection.append(powerActionsRow)
    powerActionsSection.append(reloadWallpaperButton)
    root.append(powerActionsSection)

    const nowPlayingSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    nowPlayingSection.add_css_class("arch-panel-section")
    const nowPlayingTitle = Gtk.Label.new("Now Playing")
    nowPlayingTitle.set_xalign(0)
    nowPlayingTitle.add_css_class("arch-panel-section-title")
    nowPlayingSection.append(nowPlayingTitle)

    const nowPlayingPlayerRow = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 4)
    nowPlayingPlayerRow.add_css_class("arch-nowplaying-selector")
    const previousPlayerButton = Gtk.Button.new_with_label("◀")
    const nextPlayerButton = Gtk.Button.new_with_label("▶")
    const nowPlayingPlayerLabel = Gtk.Label.new("Player: None")
    nowPlayingPlayerLabel.set_xalign(0)
    nowPlayingPlayerLabel.set_hexpand(true)
    nowPlayingPlayerLabel.add_css_class("arch-panel-section-body")
    nowPlayingPlayerRow.append(previousPlayerButton)
    nowPlayingPlayerRow.append(nowPlayingPlayerLabel)
    nowPlayingPlayerRow.append(nextPlayerButton)
    nowPlayingSection.append(nowPlayingPlayerRow)

    const nowPlayingTrackLabel = Gtk.Label.new("Nothing playing")
    nowPlayingTrackLabel.set_xalign(0)
    nowPlayingTrackLabel.set_wrap(true)
    nowPlayingTrackLabel.add_css_class("arch-panel-section-body")
    nowPlayingSection.append(nowPlayingTrackLabel)

    const nowPlayingControlsRow = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 4)
    nowPlayingControlsRow.add_css_class("arch-nowplaying-controls")
    const previousTrackButton = Gtk.Button.new_with_label("⏮")
    const playPauseButton = Gtk.Button.new_with_label("⏯")
    const nextTrackButton = Gtk.Button.new_with_label("⏭")
    nowPlayingControlsRow.append(previousTrackButton)
    nowPlayingControlsRow.append(playPauseButton)
    nowPlayingControlsRow.append(nextTrackButton)
    nowPlayingSection.append(nowPlayingControlsRow)

    const nowPlayingDisabledReason = Gtk.Label.new("")
    nowPlayingDisabledReason.set_xalign(0)
    nowPlayingDisabledReason.set_wrap(true)
    nowPlayingDisabledReason.add_css_class("arch-panel-section-body")
    nowPlayingSection.append(nowPlayingDisabledReason)
    root.append(nowPlayingSection)

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

    const bluetoothSection = Gtk.Box.new(Gtk.Orientation.VERTICAL, 4)
    bluetoothSection.add_css_class("arch-panel-section")
    const bluetoothTitle = Gtk.Label.new("Bluetooth Settings")
    bluetoothTitle.set_xalign(0)
    bluetoothTitle.add_css_class("arch-panel-section-title")
    bluetoothSection.append(bluetoothTitle)
    const bluetoothBody = Gtk.Label.new("Current: Loading...")
    bluetoothBody.set_xalign(0)
    bluetoothBody.add_css_class("arch-panel-section-body")
    bluetoothSection.append(bluetoothBody)

    const makeBluetoothGroup = (title: string) => {
        const group = Gtk.Box.new(Gtk.Orientation.VERTICAL, 2)
        group.add_css_class("arch-bluetooth-group")

        const groupTitle = Gtk.Label.new(title)
        groupTitle.set_xalign(0)
        groupTitle.add_css_class("arch-panel-section-title")
        group.append(groupTitle)

        const listBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 2)
        listBox.add_css_class("arch-bluetooth-list")
        group.append(listBox)

        bluetoothSection.append(group)
        return listBox
    }

    const connectedGroup = makeBluetoothGroup("Connected")
    const pairedGroup = makeBluetoothGroup("Paired")
    const discoveredGroup = makeBluetoothGroup("Discovered")
    const bluetoothInlineErrors = new Map<string, { action: "connect" | "disconnect" | "pair"; message: string }>()
    let nowPlayingTransportError: string | null = null
    let networkInlineError: string | null = null

    const scanButton = Gtk.Button.new_with_label("Scan (15s)")
    bluetoothSection.append(scanButton)

    const bluetoothAction = Gtk.Button.new_with_label("Open blueman-manager")
    bluetoothSection.append(bluetoothAction)
    root.append(bluetoothSection)

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

    const setSpeakerVolumeDelta = (delta: number) => {
        const speaker = Wp.get_default()?.audio.defaultSpeaker
        if (!speaker) return
        const next = Math.max(0, Math.min(1, speaker.volume + delta))
        speaker.volume = next
        refreshPanel()
    }
    speakerDown.connect("clicked", () => setSpeakerVolumeDelta(-0.05))
    speakerUp.connect("clicked", () => setSpeakerVolumeDelta(0.05))
    speakerToggleMute.connect("clicked", () => {
        const speaker = Wp.get_default()?.audio.defaultSpeaker
        if (!speaker) return
        speaker.set_mute(!speaker.get_mute())
        refreshPanel()
    })
    micToggleMute.connect("clicked", () => {
        const microphone = Wp.get_default()?.audio.defaultMicrophone
        if (!microphone) return
        microphone.set_mute(!microphone.get_mute())
        refreshPanel()
    })
    networkAction.connect("clicked", () => {
        if (!GLib.find_program_in_path("ghostty")) {
            networkInlineError = "ghostty not found in PATH"
        } else {
            Gio.Subprocess.new(["ghostty", "-e", "nmtui"], Gio.SubprocessFlags.NONE)
            networkInlineError = null
        }
        refreshPanel()
    })
    lockButton.connect("clicked", () => runCommand(["hyprlock"]))
    shutdownButton.connect("clicked", () => runCommand(["/usr/bin/systemctl", "poweroff"]))
    rebootButton.connect("clicked", () => runCommand(["/usr/bin/systemctl", "reboot"]))
    reloadWallpaperButton.connect("clicked", () =>
        runCommand([
            "sh",
            "-c",
            "if pgrep -x hyprpaper > /dev/null; then killall hyprpaper && hyprpaper & disown; else hyprpaper & disown; fi",
        ]),
    )

    const runTransportAction = (action: "play-pause" | "next" | "previous") => {
        const result = runNowPlayingTransport(action)
        if (!result.ok) {
            nowPlayingTransportError = result.error || "Transport action failed"
        } else {
            nowPlayingTransportError = null
        }
        refreshPanel()
    }

    previousPlayerButton.connect("clicked", () => {
        selectPreviousPlayer()
        refreshPanel()
    })
    nextPlayerButton.connect("clicked", () => {
        selectNextPlayer()
        refreshPanel()
    })
    previousTrackButton.connect("clicked", () => runTransportAction("previous"))
    playPauseButton.connect("clicked", () => runTransportAction("play-pause"))
    nextTrackButton.connect("clicked", () => runTransportAction("next"))

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

    const refreshAudioSection = () => {
        const speaker = Wp.get_default()?.audio.defaultSpeaker
        const microphone = Wp.get_default()?.audio.defaultMicrophone
        const controlsEnabled = !!speaker
        speakerDown.set_sensitive(controlsEnabled)
        speakerUp.set_sensitive(controlsEnabled)
        speakerToggleMute.set_sensitive(controlsEnabled)

        if (!speaker) {
            speakerStatus.set_label("Speaker: Unavailable")
        } else {
            const pct = Math.round(speaker.volume * 100)
            const muteState = speaker.get_mute() ? "muted" : "active"
            speakerStatus.set_label(`Speaker: ${pct}% (${muteState})`)
        }

        if (!microphone) {
            micStatus.set_label("Mic: Unavailable")
            micToggleMute.set_sensitive(false)
        } else {
            micStatus.set_label(`Mic: ${microphone.get_mute() ? "muted" : "active"}`)
            micToggleMute.set_sensitive(true)
        }
    }

    const refreshNetworkSection = () => {
        const network = Network.get_default()
        if (network.wired && network.wired.speed > 0) {
            networkBody.set_label(`Status: Wired (${network.wired.speed} Mbps)`)
        } else if (network.wifi && network.wifi.ssid) {
            networkBody.set_label(`Status: Wi-Fi (${network.wifi.ssid})`)
        } else {
            networkBody.set_label("Status: No network")
        }

        if (networkInlineError) {
            networkBody.set_label(`${networkBody.get_label()} | Last action error: ${networkInlineError}`)
        }
    }

    bluetoothAction.connect("clicked", () => {
        const launchResult = launchBluemanManager()
        if (!launchResult.ok) {
            bluetoothBody.set_label(`Unavailable (${launchResult.error})`)
        }
    })

    scanButton.connect("clicked", () => {
        const session = getBluetoothScanSessionState()
        const result = session.active ? stopBluetoothScanSession() : startBluetoothScanSession(15)
        if (!result.ok) bluetoothBody.set_label(`Unavailable (${result.error})`)
        refreshBluetoothSection()
    })

    const clearBoxChildren = (box: Gtk.Box) => {
        let child = box.get_first_child()
        while (child) {
            const next = child.get_next_sibling()
            box.remove(child)
            child = next
        }
    }

    const renderBluetoothDevices = (
        box: Gtk.Box,
        devices: BluetoothDevice[],
        emptyText: string,
        action: "connect" | "disconnect" | "pair",
    ) => {
        clearBoxChildren(box)
        if (devices.length === 0) {
            const empty = Gtk.Label.new(emptyText)
            empty.set_xalign(0)
            empty.add_css_class("arch-panel-section-body")
            box.append(empty)
            return
        }

        const runDeviceAction = (device: BluetoothDevice) => {
            if (action === "connect") return connectBluetoothDevice(device.address)
            if (action === "disconnect") return disconnectBluetoothDevice(device.address)
            return pairBluetoothDevice(device.address)
        }

        devices.forEach((device) => {
            const row = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6)
            const details = Gtk.Label.new(`${device.name} (${device.address})`)
            details.set_xalign(0)
            details.set_wrap(true)
            details.set_hexpand(true)
            details.add_css_class("arch-panel-section-body")
            row.append(details)

            const actionLabel = action === "connect" ? "Connect" : action === "disconnect" ? "Disconnect" : "Pair"
            const actionButton = Gtk.Button.new_with_label(actionLabel)
            const runAction = () => {
                const result = runDeviceAction(device)
                if (!result.ok) {
                    bluetoothInlineErrors.set(device.address, { action, message: result.error })
                    bluetoothBody.set_label(`Status: Action failed for ${device.name}`)
                } else {
                    bluetoothInlineErrors.delete(device.address)
                    if (result.escalated) bluetoothBody.set_label("Status: Pairing confirmation opened in blueman-manager")
                }
                refreshBluetoothSection()
            }
            actionButton.connect("clicked", runAction)
            row.append(actionButton)
            box.append(row)

            const inlineError = bluetoothInlineErrors.get(device.address)
            if (inlineError && inlineError.action === action) {
                const errorBox = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6)
                const errorLabel = Gtk.Label.new(`Error: ${inlineError.message}`)
                errorLabel.set_xalign(0)
                errorLabel.set_wrap(true)
                errorLabel.set_hexpand(true)
                errorLabel.add_css_class("arch-panel-section-body")
                errorBox.append(errorLabel)

                const retry = Gtk.Button.new_with_label("Retry")
                retry.connect("clicked", runAction)
                errorBox.append(retry)
                box.append(errorBox)
            }
        })
    }

    const refreshBluetoothSection = () => {
        const managerAvailable = canLaunchBluemanManager()
        const bluetooth = getBluetoothSummaryState()
        const groups = getBluetoothDeviceGroupsState()
        const operation = getBluetoothOperationState()
        const scanSession = getBluetoothScanSessionState()

        if (!managerAvailable) {
            bluetoothBody.set_label("Unavailable (blueman-manager not found in PATH)")
            bluetoothAction.set_sensitive(false)
            scanButton.set_sensitive(false)
            scanButton.set_label("Scan unavailable")
            renderBluetoothDevices(connectedGroup, [], "Unavailable", "disconnect")
            renderBluetoothDevices(pairedGroup, [], "Unavailable", "connect")
            renderBluetoothDevices(discoveredGroup, [], "Unavailable", "pair")
            return
        }

        if (!bluetooth.available) {
            bluetoothBody.set_label(`Unavailable (${bluetooth.error})`)
            bluetoothAction.set_sensitive(false)
            scanButton.set_sensitive(false)
            scanButton.set_label("Scan unavailable")
            renderBluetoothDevices(connectedGroup, [], "Unavailable", "disconnect")
            renderBluetoothDevices(pairedGroup, [], "Unavailable", "connect")
            renderBluetoothDevices(discoveredGroup, [], "Unavailable", "pair")
            return
        }

        if (!groups.available) {
            bluetoothBody.set_label(`Unavailable (${groups.error})`)
            bluetoothAction.set_sensitive(false)
            scanButton.set_sensitive(false)
            scanButton.set_label("Scan unavailable")
            renderBluetoothDevices(connectedGroup, [], "Unavailable", "disconnect")
            renderBluetoothDevices(pairedGroup, [], "Unavailable", "connect")
            renderBluetoothDevices(discoveredGroup, [], "Unavailable", "pair")
            return
        }

        const operationSuffix = operation.busy ? ` | Busy: ${operation.currentAction || "action"}` : ""
        const errorSuffix = operation.lastError ? ` | Last error: ${operation.lastError}` : ""
        const scanSuffix = scanSession.active ? " | Scan: active" : " | Scan: idle"
        bluetoothBody.set_label(`Status: ${bluetooth.text}${scanSuffix}${operationSuffix}${errorSuffix}`)
        bluetoothAction.set_sensitive(!operation.busy)
        scanButton.set_sensitive(!operation.busy)
        scanButton.set_label(scanSession.active ? "Stop Scan" : "Scan (15s)")
        const activeAddresses = new Set(
            [...groups.connected, ...groups.paired, ...groups.discovered].map((device) => device.address),
        )
        Array.from(bluetoothInlineErrors.keys()).forEach((address) => {
            if (!activeAddresses.has(address)) bluetoothInlineErrors.delete(address)
        })
        renderBluetoothDevices(connectedGroup, groups.connected, "No connected devices", "disconnect")
        renderBluetoothDevices(pairedGroup, groups.paired, "No paired devices", "connect")
        renderBluetoothDevices(discoveredGroup, groups.discovered, "No discovered devices", "pair")
    }

    const refreshPanel = () => {
        refreshPowerProfileSection()
        refreshAudioSection()
        refreshNetworkSection()
        const nowPlaying = getNowPlayingSectionState()
        if (!nowPlaying.available) {
            nowPlayingPlayerLabel.set_label("Player: Unavailable")
            nowPlayingTrackLabel.set_label(`Unavailable (${nowPlaying.error})`)
            nowPlayingDisabledReason.set_label("No players available")
            previousPlayerButton.set_sensitive(false)
            nextPlayerButton.set_sensitive(false)
            previousTrackButton.set_sensitive(false)
            playPauseButton.set_sensitive(false)
            nextTrackButton.set_sensitive(false)
        } else {
            nowPlayingPlayerLabel.set_label(`Player: ${nowPlaying.selectedPlayerLabel}`)
            nowPlayingTrackLabel.set_label(nowPlaying.trackText)
            nowPlayingDisabledReason.set_label(nowPlaying.disabledReason || nowPlayingTransportError || "")
            const hasMultiplePlayers = nowPlaying.players.length > 1
            previousPlayerButton.set_sensitive(hasMultiplePlayers)
            nextPlayerButton.set_sensitive(hasMultiplePlayers)
            previousTrackButton.set_sensitive(nowPlaying.controlsEnabled)
            playPauseButton.set_sensitive(nowPlaying.controlsEnabled)
            nextTrackButton.set_sensitive(nowPlaying.controlsEnabled)
        }
        refreshUserIdentitySection()
        refreshBluetoothSection()
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
    const unsubscribeBluetooth = subscribeBluetoothOperationChanged(refreshBluetoothSection)

    button.connect("destroy", () => {
        if (refreshTimer !== null) GLib.Source.remove(refreshTimer)
        unsubscribe()
        unsubscribeBluetooth()
    })

    button.set_popover(popover)
    return button
}
