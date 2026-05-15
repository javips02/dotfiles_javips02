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
            actionButton.connect("clicked", () => {
                const result = runDeviceAction(device)
                if (!result.ok) bluetoothBody.set_label(`Unavailable (${result.error})`)
                else if (result.escalated) bluetoothBody.set_label("Status: Pairing confirmation opened in blueman-manager")
                refreshBluetoothSection()
            })
            row.append(actionButton)
            box.append(row)
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
        renderBluetoothDevices(connectedGroup, groups.connected, "No connected devices", "disconnect")
        renderBluetoothDevices(pairedGroup, groups.paired, "No paired devices", "connect")
        renderBluetoothDevices(discoveredGroup, groups.discovered, "No discovered devices", "pair")
    }

    const refreshPanel = () => {
        refreshPowerProfileSection()
        const nowPlaying = getNowPlayingState()
        if (nowPlaying.available) {
            nowPlayingBody.set_label(nowPlaying.text)
        } else {
            nowPlayingBody.set_label(`Unavailable (${nowPlaying.error})`)
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
